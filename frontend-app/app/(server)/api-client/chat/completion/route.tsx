import { getCurrentUser, requireAuth } from "@/app/lib/auth/middleware";
import { getDocumentById } from "@/app/lib/db/documents";
import { testAgent } from "@/mastra/agents/docs_agent";
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

// Change threadID to conversation ID with Sesion User
// const threadId = randomUUID();

export async function POST(request: NextRequest) {
  // Error 401 (authorization)
  const authError = await requireAuth(request);
  if (authError) return authError;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized - login required",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  // const currentUser = { userId: "demo-user-id" };
  // Get User session
  const resourceId = currentUser.userId;

  // Error 400
  let requestBody;
  try {
    requestBody = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  const parsed = requestSchema.safeParse(requestBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  type TextContent = { type: "text"; text: string };
  type FileContent = {
    type: "file";
    filename: string;
    data: unknown;
    mimeType: string;
  };
  type ContentItem = TextContent | FileContent;

  const requestChat: { role: string; content: ContentItem[] }[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: parsed.data?.prompt,
        },
      ],
    },
  ];

  if (parsed.data.documentIds && parsed.data.documentIds.length > 0) {
    // Add document references to the agent's memory or context if needed
    // This part depends on how the agent and memory are implemented
    const docparsed: string[] = [];
    for (let i = 0; i < parsed.data.documentIds.length; i++) {
      if (docparsed.includes(parsed.data.documentIds[i])) continue;
      docparsed.push(parsed.data.documentIds[i]);

      const doc_content = await getDocumentById(parsed.data.documentIds[i]);
      if (!doc_content) continue;

      const message: FileContent = {
        type: "file",
        filename: doc_content?.filename || "document.txt",
        data: doc_content?.data,
        mimeType: doc_content?.mimeType || "text/plain",
      };
      requestChat[0].content.push(message);
    }
  }

  // Stream response
  try {
    const stream = await testAgent.stream(requestChat as MessageListInput, {
      memory: {
        thread: parsed.data.conversation_id,
        resource: resourceId,
      },
      // memoryOptions: {
      //     lastMessages: 5,
      //     semanticRecall: {
      //         topK: 3,
      //         messageRange: 2
      //     }
      // }
    });

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
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Completion error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate completion" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}