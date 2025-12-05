import { getCurrentUser, requireAuth } from "@/app/lib/auth/middleware";
import { mongoStore } from "@/mastra/agents/docs_agent";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

/**
 * GET /api-client/chat/history?id=xxx
 * Get chat history
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { error: "Unauthorized - login required" },
      { status: 401 },
    );
  }

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
    if (thread.resourceId !== currentUser.userId) {
      return NextResponse.json(
        { error: "Forbidden - access to this chat history is denied" },
        { status: 403 },
      );
    }

    const messages = await mongoStore.getMessages({ threadId: historyId });
    if (!messages) {
      return NextResponse.json(
        { error: "No messages found for this history" },
        { status: 404 },
      );
    }

    // Filter out intermediate tool messages - only keep user and assistant text messages
    const filteredMessages = messages.filter((msg: any) => {
      // Skip tool role messages entirely
      if (msg.role === "tool") return false;

      // Skip messages with tool-call or tool-result type
      if (msg.type === "tool-call" || msg.type === "tool-result") return false;

      // Check content array for tool types
      if (Array.isArray(msg.content)) {
        const hasOnlyToolContent = msg.content.every(
          (part: any) =>
            part.type === "tool-call" || part.type === "tool-result",
        );
        if (hasOnlyToolContent) return false;
      }

      return true;
    });

    // Filter out messages with empty content after processing
    const nonEmptyMessages = filteredMessages.filter((msg: any) => {
      if (typeof msg.content === "string") {
        return msg.content.trim().length > 0;
      }
      if (Array.isArray(msg.content)) {
        return msg.content.some((part: any) => {
          if (typeof part === "string") return part.trim().length > 0;
          if (part.type === "text" && part.text)
            return part.text.trim().length > 0;
          return false;
        });
      }
      return false;
    });
    return new Response(
      JSON.stringify({
        success: true,
        threadId: thread.id,
        length: nonEmptyMessages.length,
        thread: {
          userId: thread.resourceId,
          title: thread.title,
          updatedAt: thread.updatedAt,
          createdAt: thread.createdAt,
        },
        messages: nonEmptyMessages,
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
