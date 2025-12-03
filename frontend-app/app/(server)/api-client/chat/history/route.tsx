import { mongoStore } from "@/mastra/agents/docs_agent";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

/**
 * GET /api-client/chat/history?id=xxx
 * Get chat history
 */
export async function GET(request: NextRequest) {
  // const authError = await requireAuth(request);
  // if (authError) return authError;

  // const currentUser = await getCurrentUser();
  // if (!currentUser) {
  //   return NextResponse.json(
  //     { error: "Unauthorized - login required" },
  //     { status: 401 },
  //   );
  // }

  try {
    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (!historyId) {
      return NextResponse.json(
        { error: "History ID is required" },
        { status: 400 },
      );
    }

    if (!z.uuid().safeParse(historyId).success) {
      return NextResponse.json(
        { error: "Invalid history ID" },
        { status: 400 },
      );
    }

    const thread = await mongoStore.getThreadById({ threadId: historyId });
    if (!thread) {
      return NextResponse.json(
        { error: "Chat history not found" },
        { status: 404 },
      );
    }

    const messages = await mongoStore.getMessages({ threadId: historyId });
    if (!messages) {
      return NextResponse.json(
        { error: "No messages found for this history" },
        { status: 404 },
      );
    }

    console.log("Mongo Store Thread:", thread);
    console.log("Mongo Store Messages:", messages);

    return new Response(
      JSON.stringify({
        success: true,
        threadId: thread.id,
        length: messages.length,
        thread: {
          userId: thread.resourceId,
          title: thread.title,
          updatedAt: thread.updatedAt,
          createdAt: thread.createdAt,
        },
        messages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}
