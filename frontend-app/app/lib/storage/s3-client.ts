import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

// Initialize S3 client (works with any S3-compatible service)
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true, // Required for some S3-compatible services like MinIO
});

const BUCKET_NAME = process.env.S3_BUCKET || 'employai-documents';
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .slice(0, 200); // Limit length
}

/**
 * Generate unique file key for S3
 */
export function generateFileKey(userId: string, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const uniqueId = nanoid(12);
  return `users/${userId}/${uniqueId}-${sanitized}`;
}

/**
 * Upload file to S3
 */
export async function uploadFileToS3(
  fileKey: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ success: boolean; fileUrl: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
      // Add metadata
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // Construct file URL (for reference, actual downloads will use presigned URLs)
    const fileUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${fileKey}`;

    return {
      success: true,
      fileUrl,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      fileUrl: '',
      error: 'Failed to upload file to storage',
    };
  }
}

/**
 * Generate presigned URL for downloading file
 */
export async function generatePresignedUrl(fileKey: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return null;
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(fileKey: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

/**
 * Get file from S3 (for processing, e.g., AI chat)
 */
export async function getFileFromS3(fileKey: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return null;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting file from S3:', error);
    return null;
  }
}

/**
 * Validate S3 configuration
 */
export function validateS3Config(): { valid: boolean; error?: string } {
  if (!process.env.S3_ENDPOINT) {
    return { valid: false, error: 'S3_ENDPOINT not configured' };
  }
  if (!process.env.S3_BUCKET) {
    return { valid: false, error: 'S3_BUCKET not configured' };
  }
  if (!process.env.S3_ACCESS_KEY) {
    return { valid: false, error: 'S3_ACCESS_KEY not configured' };
  }
  if (!process.env.S3_SECRET_KEY) {
    return { valid: false, error: 'S3_SECRET_KEY not configured' };
  }

  return { valid: true };
}
