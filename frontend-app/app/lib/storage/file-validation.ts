// File validation utilities

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

// MIME type to extension mapping
const MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

// Human-readable file type names
const MIME_TYPE_NAMES: Record<string, string> = {
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Document",
  "text/plain": "Text File",
  "image/png": "PNG Image",
  "image/jpeg": "JPEG Image",
  "image/jpg": "JPEG Image",
};

/**
 * Get max file size from environment or use default (50MB)
 */
export function getMaxFileSize(): number {
  const maxSizeMB = Number.parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10);
  return maxSizeMB * 1024 * 1024; // Convert to bytes
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number): {
  valid: boolean;
  error?: string;
} {
  const maxSize = getMaxFileSize();

  if (fileSize > maxSize) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    const allowedTypes = ALLOWED_MIME_TYPES.map(
      (type) => MIME_TYPE_NAMES[type] || type,
    ).join(", ");
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes}`,
    };
  }

  return { valid: true };
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): {
  valid: boolean;
  error?: string;
} {
  if (!filename || filename.trim().length === 0) {
    return {
      valid: false,
      error: "Filename is required",
    };
  }

  if (filename.length > 255) {
    return {
      valid: false,
      error: "Filename is too long (max 255 characters)",
    };
  }

  // Check for suspicious patterns
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return {
      valid: false,
      error: "Filename contains invalid characters",
    };
  }

  return { valid: true };
}

/**
 * Validate complete file
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const filenameValidation = validateFilename(filename);
  if (!filenameValidation.valid && filenameValidation.error) {
    errors.push(filenameValidation.error);
  }

  const mimeTypeValidation = validateMimeType(mimeType);
  if (!mimeTypeValidation.valid && mimeTypeValidation.error) {
    errors.push(mimeTypeValidation.error);
  }

  const fileSizeValidation = validateFileSize(fileSize);
  if (!fileSizeValidation.valid && fileSizeValidation.error) {
    errors.push(fileSizeValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  return MIME_TO_EXTENSION[mimeType] || "bin";
}

/**
 * Get human-readable file type name
 */
export function getFileTypeName(mimeType: string): string {
  return MIME_TYPE_NAMES[mimeType] || "Unknown";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get allowed file extensions for file input
 */
export function getAllowedFileExtensions(): string {
  return ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg";
}

/**
 * Get allowed MIME types list
 */
export function getAllowedMimeTypes(): string[] {
  return [...ALLOWED_MIME_TYPES];
}
