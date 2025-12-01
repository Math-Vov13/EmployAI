import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth/middleware";
import { getCurrentUser } from "@/app/lib/auth/session";
import { getChatsCollection } from "@/app/lib/db/mongodb";
import { toChatResponse } from "@/app/lib/db/models/Chat";
import { ObjectId } from "mongodb";

/**
 * GET /api-client/chat/history?documentId=xxx
 * Get chat history for a specific document
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
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { error: "Invalid document ID" },
        { status: 400 },
      );
    }

    const chatsCollection = await getChatsCollection();
    const chat = await chatsCollection.findOne({
      userId: new ObjectId(currentUser.userId),
      documentId: new ObjectId(documentId),
    });

    if (!chat) {
      return NextResponse.json({
        success: true,
        chat: null,
        messages: [],
      });
    }

    return NextResponse.json({
      success: true,
      chat: toChatResponse(chat),
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}
