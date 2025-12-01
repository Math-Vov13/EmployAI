import { testAgent } from "@/mastra/agents/docs_agent";
import { randomUUID } from "crypto";
import z from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const threadId = randomUUID();
export async function POST(request: Request) {
  // Error 400
  const requestBody = await request.json();
  const parsed = requestSchema.safeParse(requestBody);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Error 403 (authorization)
  // TODO
  const resourceId = "user-456";

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
}
