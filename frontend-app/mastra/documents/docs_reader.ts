import * as cheerio from "cheerio";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/legacy/build/pdf.worker.mjs";
import * as XLSX from "xlsx";

const getDocument = pdfjsLib.getDocument;

export async function readDocumentFromBytes(
  bytes: Uint8Array,
  mimeType: string,
): Promise<string> {
  // Supported formats:
  // - PDF: application/pdf
  // - Plain text: text/plain
  // - Markdown: text/markdown
  // - CSV: text/csv
  // - HTML: text/html
  // - Word documents: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  // - Excel spreadsheets: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  // Images are not processed (as per requirements)
  switch (mimeType) {
    case "application/pdf":
      return await readPdfFromBytes(bytes);
    case "text/plain":
    case "text/markdown":
    case "text/csv":
      return new TextDecoder("utf-8").decode(bytes);
    case "text/html":
      return readHtmlFromBytes(bytes);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return await readDocxFromBytes(bytes);
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return readXlsxFromBytes(bytes);
    default:
      // Try to read as text for unknown types
      try {
        return new TextDecoder("utf-8").decode(bytes);
      } catch {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
  }
}

async function readPdfFromBytes(bytes: Uint8Array) {
  try {
    const pdf = await getDocument({ data: bytes, disableWorker: true } as any)
      .promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items.map((item: any) => item.str).join(" ");

      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    if (error instanceof Error && error.name === "InvalidPDFException") {
      throw new Error("The uploaded file is not a valid PDF or is corrupted.");
    }
    throw error;
  }
}

async function readDocxFromBytes(bytes: Uint8Array): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return result.value;
  } catch (error) {
    throw new Error("The uploaded file is not a valid DOCX or is corrupted.");
  }
}

function readHtmlFromBytes(bytes: Uint8Array): string {
  try {
    const html = new TextDecoder("utf-8").decode(bytes);
    const $ = cheerio.load(html);
    return $.text();
  } catch (error) {
    throw new Error("The uploaded file is not a valid HTML or is corrupted.");
  }
}

function readXlsxFromBytes(bytes: Uint8Array): string {
  try {
    const workbook = XLSX.read(bytes, { type: "buffer" });
    let fullText = "";

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      fullText += `Sheet: ${sheetName}\n${csv}\n\n`;
    });

    return fullText;
  } catch (error) {
    throw new Error("The uploaded file is not a valid XLSX or is corrupted.");
  }
}