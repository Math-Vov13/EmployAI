import { testAgent } from "@/mastra/agents/docs_agent";
import { requireAuth } from "@/app/lib/auth/middleware";
import { getCurrentUser } from "@/app/lib/auth/session";
import { randomUUID } from "node:crypto";
import z from "zod";
import { NextRequest } from "next/server";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

// Change threadID to conversation ID with Sesion User
const threadId = randomUUID();

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

  // Get User session
  // TODO
  const resourceId = "user-456";

  // Error 400
  const requestBody = await request.json();
  const parsed = requestSchema.safeParse(requestBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream response
  try {
    const stream = await testAgent.stream(parsed.data?.prompt, {
      memory: {
        thread: threadId,
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
