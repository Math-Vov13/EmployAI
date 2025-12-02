/**
 * Extract text from PDF buffer
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse to handle ESM/CJS compatibility
    const pdfParse = await import('pdf-parse');
    const data = await (pdfParse as any)(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from plain text buffer
 */
function extractTextFromPlainText(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Extract text from document based on MIME type
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    let text: string;

    // Handle different file types
    if (mimeType === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (mimeType === 'text/plain') {
      text = extractTextFromPlainText(buffer);
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      // For Word documents, we'd need additional libraries like mammoth
      // For MVP, we'll return a message
      return {
        success: false,
        error: 'Word document text extraction not yet supported. Please convert to PDF.',
      };
    } else if (mimeType.includes('image')) {
      // For images, we'd need OCR (like Tesseract)
      // For MVP, we'll return a message
      return {
        success: false,
        error: 'Image text extraction not yet supported. Please use PDF or text files.',
      };
    } else {
      return {
        success: false,
        error: 'Unsupported file type for text extraction',
      };
    }

    // Clean up the text
    text = text.trim();

    if (!text || text.length === 0) {
      return {
        success: false,
        error: 'No text found in document',
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error('Error extracting text from document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract text',
    };
  }
}

/**
 * Truncate text to a maximum length (for API limits)
 */
export function truncateText(text: string, maxLength: number = 50000): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + '\n\n...(text truncated due to length)';
}

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
