import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth/middleware";
import { getCurrentUser } from "@/app/lib/auth/session";
import { getChatsCollection } from "@/app/lib/db/mongodb";
import { toChatResponse } from "@/app/lib/db/models/Chat";
import { ObjectId } from "mongodb";

/**
 * GET /api-client/chat
 * Get all chat sessions for the current user
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
    const chatsCollection = await getChatsCollection();
    const chats = await chatsCollection
      .find({ userId: new ObjectId(currentUser.userId) })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      chats: chats.map(toChatResponse),
      count: chats.length,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 },
    );
  }
}
