import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Generate a response from OpenAI based on document content and user message
 */
export async function generateChatResponse(
  documentContent: string,
  documentTitle: string,
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    // Build system message with document context
    const systemMessage = `You are a helpful AI assistant that helps users understand and analyze documents.

Document Title: ${documentTitle}

Document Content:
${documentContent.slice(0, 10000)} ${documentContent.length > 10000 ? '...(truncated)' : ''}

Your task is to help the user understand this document by:
- Answering questions about its content
- Summarizing key points
- Extracting specific information
- Explaining complex concepts

Be concise, accurate, and helpful. If the user's question cannot be answered from the document, let them know.`;

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate response',
    };
  }
}

/**
 * Generate a summary of a document
 */
export async function generateDocumentSummary(
  documentContent: string,
  documentTitle: string
): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    const prompt = `Please provide a concise summary of this document in 3-5 bullet points.

Document Title: ${documentTitle}

Document Content:
${documentContent.slice(0, 10000)} ${documentContent.length > 10000 ? '...(truncated)' : ''}`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates concise document summaries.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content;

    if (!summary) {
      return {
        success: false,
        error: 'No summary generated',
      };
    }

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate summary',
    };
  }
}

/**
 * Validate OpenAI configuration
 */
export function validateOpenAIConfig(): { valid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return { valid: false, error: 'OPENAI_API_KEY not configured' };
  }

  return { valid: true };
}
