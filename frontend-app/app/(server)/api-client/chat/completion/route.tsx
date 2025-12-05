import { getCurrentUser, requireAuth } from "@/app/lib/auth/middleware";
import { getDocumentById } from "@/app/lib/db/documents";
import { mongoStore, testAgent } from "@/mastra/agents/docs_agent";
import { MessageListInput } from "@mastra/core/agent/message-list";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import z from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  conversation_id: z.uuid(),
  documentIds: z
    .array(
      z.string().refine((id) => ObjectId.isValid(id), {
        message: "One or more document IDs are invalid",
      }),
    )
    .max(5, "A maximum of 5 document IDs can be provided")
    .optional(),
});

// Helper: Validate authentication
async function validateAuth(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return { error: authError, user: null };

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized - login required" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
      user: null,
    };
  }

  return { error: null, user: currentUser };
}

// Helper: Parse and validate request body
async function parseRequestBody(request: NextRequest) {
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return {
      error: new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
      data: null,
    };
  }

  const parsed = requestSchema.safeParse(requestBody);
  if (!parsed.success) {
    return {
      error: new Response(JSON.stringify({ error: parsed.error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
      data: null,
    };
  }

  return { error: null, data: parsed.data };
}

// Helper: Check thread access permissions
async function checkThreadPermissions(conversationId: string, userId: string) {
  const thread = await mongoStore.getThreadById({ threadId: conversationId });

  if (thread && thread.resourceId !== userId) {
    return new Response(
      JSON.stringify({
        error: "Forbidden - You do not have write access to this chat history",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return null;
}

type TextContent = { type: "text"; text: string };
type FileContent = {
  type: "file";
  filename: string;
  data: unknown;
  mimeType: string;
};

type ContentItem = TextContent | FileContent;

// Helper: Fetch a single document
async function fetchDocument(documentId: string): Promise<FileContent | null> {
  try {
    const doc_content = await getDocumentById(documentId);

    if (!doc_content) {
      return null;
    }

    return {
      type: "file",
      filename: doc_content?.filename || "document.txt",
      data: doc_content?.data,
      mimeType: doc_content?.mimeType || "text/plain",
    };
  } catch (docError) {
    console.error(`❌ Error fetching document ${documentId}:`, docError);
    return null;
  }
}

// Helper: Process documents and attach to request
async function processDocuments(
  documentIds: string[] | undefined,
  requestChat: { role: string; content: ContentItem[] }[],
) {
  if (!documentIds || documentIds.length === 0) {
    return null;
  }

  const uniqueDocIds = [...new Set(documentIds)];
  let fetchErrors = 0;

  for (const docId of uniqueDocIds) {
    const fileContent = await fetchDocument(docId);

    if (fileContent) {
      requestChat[0].content.push(fileContent);
    } else {
      fetchErrors++;
    }
  }

  const attachedCount = requestChat[0].content.length - 1;
  console.log(
    `📎 Documents attached: ${attachedCount}/${documentIds.length} (${fetchErrors} failed)`,
  );

  if (attachedCount === 0 && documentIds.length > 0) {
    return new Response(
      JSON.stringify({
        error:
          "Failed to fetch documents. MongoDB connection issue detected. Please check your network connection or try again without selecting documents.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return null;
}

// Helper: Create agent stream with fallback
async function createAgentStream(
  requestChat: MessageListInput,
  conversationId: string,
  resourceId: string,
) {
  try {
    return await testAgent.stream(requestChat, {
      memory: {
        thread: conversationId,
        resource: resourceId,
      },
    });
  } catch (memoryError) {
    console.warn("⚠️  Memory failed, streaming without memory:", memoryError);
    return await testAgent.stream(requestChat);
  }
}

// Helper: Create streaming response
function createStreamingResponse(stream: any): Response {
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream.fullStream) {
          const payload =
            typeof chunk === "string" ? chunk : JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`${payload}\n`));
        }
      } catch (error) {
        console.error("❌ Stream error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// Helper: Create error response
function createErrorResponse(error: unknown): Response {
  console.error("Error details:", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    type: error?.constructor?.name,
  });

  return new Response(
    JSON.stringify({
      error: "Failed to generate completion",
      details: error instanceof Error ? error.message : "Unknown error",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function POST(request: NextRequest) {
  const authResult = await validateAuth(request);
  if (authResult.error) return authResult.error;

  const currentUser = authResult.user!;
  const resourceId = currentUser.userId;

  const parseResult = await parseRequestBody(request);
  if (parseResult.error) return parseResult.error;

  const parsed = parseResult.data!;

  const permissionError = await checkThreadPermissions(
    parsed.conversation_id,
    currentUser.userId,
  );
  if (permissionError) return permissionError;

  const requestChat: { role: string; content: ContentItem[] }[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: parsed.prompt,
        },
      ],
    },
  ];

  const docError = await processDocuments(parsed.documentIds, requestChat);
  if (docError) return docError;

  try {
    const stream = await createAgentStream(
      requestChat as MessageListInput,
      parsed.conversation_id,
      resourceId,
    );

    return createStreamingResponse(stream);
  } catch (error) {
    return createErrorResponse(error);
  }
}
