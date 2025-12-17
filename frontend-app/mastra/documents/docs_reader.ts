import * as cheerio from "cheerio";
import mammoth from "mammoth";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// import "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { extractText } from "unpdf";
import * as XLSX from "xlsx";

// const getDocument = pdfjsLib.getDocument;

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

async function readPdfFromBytes(pdfBuffer: Uint8Array) {
  try {
    // unpdf détecte automatiquement le format du binaire
    // merge: true fusionne toutes les pages en une seule string
    const { text, totalPages } = await extractText(pdfBuffer, {
      mergePages: true,
    });

    if (!text || text.trim().length === 0) {
      console.warn(
        `Attention: PDF valide (${totalPages} pages) mais aucun texte extrait. (Peut-être une image ?)`,
      );
      return "";
    }

    return text;
  } catch (error) {
    console.error("Erreur lors de l'extraction du PDF:", error);
    throw new Error("Impossible de lire le contenu du PDF.");
  }
}

async function readDocxFromBytes(bytes: Uint8Array): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return result.value;
  } catch {
    throw new Error("The uploaded file is not a valid DOCX or is corrupted.");
  }
}

function readHtmlFromBytes(bytes: Uint8Array): string {
  try {
    const html = new TextDecoder("utf-8").decode(bytes);
    const $ = cheerio.load(html);
    return $.text();
  } catch {
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
  } catch {
    throw new Error("The uploaded file is not a valid XLSX or is corrupted.");
  }
}
