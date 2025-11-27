import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveUser } from '@/app/lib/auth/session';
import { prisma } from '@/app/lib/db/prisma';
import { getFileFromS3 } from '@/app/lib/storage/s3-client';
import { extractTextFromDocument, truncateText, cleanExtractedText } from '@/app/lib/ai/text-extraction';
import { generateChatResponse, validateOpenAIConfig } from '@/app/lib/ai/openai-client';

// Validation schema
const ChatRequestSchema = z.object({
  documentId: z.string(),
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
  chatHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional().default([]),
});

// POST /api/chat/summarize - Chat with AI about a document
export async function POST(request: NextRequest) {
  try {
    const session = await requireActiveUser();

    // Validate OpenAI configuration
    const openAIValidation = validateOpenAIConfig();
    if (!openAIValidation.valid) {
      return NextResponse.json(
        { error: openAIValidation.error || 'AI service not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { documentId, message, chatHistory } = validation.data;

    // Find document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only allow chatting with online documents
    if (document.status !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Document not available for chat' },
        { status: 403 }
      );
    }

    // Get file from S3
    const fileBuffer = await getFileFromS3(document.fileKey);

    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'Failed to retrieve document content' },
        { status: 500 }
      );
    }

    // Extract text from document
    const extractionResult = await extractTextFromDocument(fileBuffer, document.mimeType);

    if (!extractionResult.success || !extractionResult.text) {
      return NextResponse.json(
        { error: extractionResult.error || 'Failed to extract text from document' },
        { status: 500 }
      );
    }

    // Clean and truncate text
    const cleanedText = cleanExtractedText(extractionResult.text);
    const truncatedText = truncateText(cleanedText, 50000);

    // Generate AI response
    const aiResponse = await generateChatResponse(
      truncatedText,
      document.title,
      message,
      chatHistory
    );

    if (!aiResponse.success || !aiResponse.response) {
      return NextResponse.json(
        { error: aiResponse.error || 'Failed to generate response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: aiResponse.response,
        document: {
          id: document.id,
          title: document.title,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in chat:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
      }
      if (error.message === 'Account temporarily suspended') {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
