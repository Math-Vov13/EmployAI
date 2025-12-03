import { mongoStore } from "@/mastra/agents/docs_agent";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api-client/chat
 * Get all chat sessions for the current user
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
  const currentUser = { userId: "user-456" }; // TODO: Remove mock user

  try {
    const user_data = await mongoStore.getThreadsByResourceId({
      resourceId: currentUser.userId,
    });
    console.log("Mongo Store User Data:", user_data);
    return new Response(JSON.stringify({
      success: true,
      userId: currentUser.userId,
      threads: user_data,
      count: user_data.length,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 },
    );
  }
}
