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
    console.log("📄 Processing documents:", parsed.data.documentIds);
    const docparsed: string[] = [];
    let fetchErrors = 0;

    for (let i = 0; i < parsed.data.documentIds.length; i++) {
      if (docparsed.includes(parsed.data.documentIds[i])) continue;
      docparsed.push(parsed.data.documentIds[i]);

      try {
        console.log(
          `Fetching document ${i + 1}/${parsed.data.documentIds.length}: ${parsed.data.documentIds[i]}`,
        );
        const doc_content = await getDocumentById(parsed.data.documentIds[i]);

        if (!doc_content) {
          console.warn(
            `⚠️  Document not found or not approved: ${parsed.data.documentIds[i]}`,
          );
          fetchErrors++;
          continue;
        }

        console.log(
          `✅ Document fetched: ${doc_content.filename} (${doc_content.mimeType})`,
        );
        const message: FileContent = {
          type: "file",
          filename: doc_content?.filename || "document.txt",
          data: doc_content?.data,
          mimeType: doc_content?.mimeType || "text/plain",
        };
        requestChat[0].content.push(message);
      } catch (docError) {
        console.error(
          `❌ Error fetching document ${parsed.data.documentIds[i]}:`,
          docError,
        );
        fetchErrors++;
        // Continue with next document instead of failing completely
      }
    }

    const attachedCount = requestChat[0].content.length - 1;
    console.log(
      `📎 Documents attached: ${attachedCount}/${parsed.data.documentIds.length} (${fetchErrors} failed)`,
    );

    // If all documents failed to fetch, return error
    if (attachedCount === 0 && parsed.data.documentIds.length > 0) {
      return new Response(
        JSON.stringify({
          error:
            "Failed to fetch documents. MongoDB connection issue detected. Please check your network connection or try again without selecting documents.",
        }),
        {
          status: 503, // Service Unavailable
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // Stream response
  try {
    console.log("🤖 Starting agent stream...");
    console.log("Request chat:", JSON.stringify(requestChat, null, 2));

    // Try with memory first, fallback to no memory if MongoDB fails
    let stream;
    try {
      stream = await testAgent.stream(requestChat as MessageListInput, {
        memory: {
          thread: parsed.data?.conversation_id,
          resource: resourceId,
        },
      });
      console.log("✅ Agent stream with memory created successfully");
    } catch (memoryError) {
      console.warn("⚠️  Memory failed, streaming without memory:", memoryError);
      // Fallback: stream without memory (conversation won't be persisted in Mastra)
      stream = await testAgent.stream(requestChat as MessageListInput);
      console.log("✅ Agent stream without memory created successfully");
    }

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.fullStream) {
            const payload =
              typeof chunk === "string" ? chunk : JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`${payload}\n`));
          }
          console.log("✅ Stream completed successfully");
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
  } catch (error) {
    console.error("❌ Completion error:", error);
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
}
