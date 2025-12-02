# File Validation Guide

## Overview

The file validation system ensures that only allowed file types and sizes can be uploaded to EmployAI. This protects the system from malicious files and manages storage efficiently.

**Implementation Date**: December 2, 2025

---

## Allowed File Types

### Supported Formats

| Format         | MIME Type                                                                 | Extensions | Description            |
| -------------- | ------------------------------------------------------------------------- | ---------- | ---------------------- |
| **PDF**        | `application/pdf`                                                         | `.pdf`     | PDF Documents          |
| **Word (Old)** | `application/msword`                                                      | `.doc`     | Microsoft Word 97-2003 |
| **Word (New)** | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx`    | Microsoft Word 2007+   |
| **Text**       | `text/plain`                                                              | `.txt`     | Plain text files       |

### NOT Allowed

- ❌ Images (PNG, JPG, GIF, etc.)
- ❌ Excel files
- ❌ PowerPoint files
- ❌ Compressed files (ZIP, RAR, etc.)
- ❌ Executables
- ❌ Any other file types

---

## File Size Limits

### Maximum File Size

**Default**: 50 MB (52,428,800 bytes)

Can be configured via environment variable:

```env
MAX_FILE_SIZE_MB=50  # Set to desired size in megabytes
```

### Minimum File Size

**Minimum**: > 0 bytes (file cannot be empty)

---

## Validation Rules

### 1. Filename Validation

**Rules**:

- ✅ Must not be empty
- ✅ Maximum 255 characters
- ✅ Cannot contain path traversal patterns (`..`)
- ✅ Cannot contain path separators (`/` or `\`)

**Examples**:

```
✅ "Company Policy 2025.pdf"
✅ "Employee_Handbook.docx"
✅ "meeting-notes.txt"
❌ "../../../etc/passwd"
❌ "file/with/slashes.pdf"
❌ "file\\with\\backslashes.doc"
```

### 2. MIME Type Validation

**Rules**:

- ✅ Must match one of the allowed MIME types
- ✅ Checked against whitelist

**Examples**:

```
✅ application/pdf
✅ application/msword
✅ application/vnd.openxmlformats-officedocument.wordprocessingml.document
✅ text/plain
❌ image/png
❌ application/zip
❌ application/x-executable
```

### 3. File Size Validation

**Rules**:

- ✅ Must be greater than 0 bytes
- ✅ Must not exceed maximum size (default 50 MB)

**Examples**:

```
✅ 1 KB file
✅ 25 MB PDF
✅ 49.9 MB document
❌ 0 bytes (empty file)
❌ 51 MB file
❌ 100 MB document
```

---

## How It Works

### Two-Layer Validation

#### 1. Client-Side Validation (Immediate Feedback)

**File**: `components/documents/DocumentUploadForm.tsx`

**Triggers**:

- When user selects a file
- Before form submission

**Benefits**:

- ✅ Instant feedback (no server round-trip)
- ✅ Prevents invalid uploads
- ✅ Better user experience
- ✅ Reduces server load

**What Happens**:

```typescript
// When file is selected
const validation = validateFile(file.name, file.type, file.size);

if (!validation.valid) {
  // Show errors immediately
  setFileValidationErrors(validation.errors);
  // Clear the file
  setFile(null);
  // Disable submit button
  return;
}
```

#### 2. Server-Side Validation (Security Layer)

**File**: `app/(server)/api-client/documents/route.ts`

**Triggers**:

- When upload request reaches the server

**Benefits**:

- ✅ Cannot be bypassed by client manipulation
- ✅ Final security check
- ✅ Protects against malicious uploads

**What Happens**:

```typescript
const fileValidation = validateFile(file.name, file.type, file.size);

if (!fileValidation.valid) {
  return NextResponse.json(
    { error: "File validation failed", details: fileValidation.errors },
    { status: 400 },
  );
}
```

---

## User Experience

### Valid File Upload Flow

```
1. User clicks "Select File"
2. Chooses valid PDF file (5 MB)
3. ✅ File accepted immediately
4. File name shown with size
5. Title auto-filled from filename
6. User clicks "Upload Document"
7. ✅ Server validates again
8. File uploaded successfully
9. Success message shown
```

### Invalid File Upload Flow (Wrong Type)

```
1. User clicks "Select File"
2. Chooses PNG image file
3. ❌ Validation fails instantly
4. Error shown:
   "File validation failed:
   • File type not allowed. Allowed types: PDF Document,
     Word Document, Text File"
5. File input cleared
6. Submit button disabled
7. User must select valid file
```

### Invalid File Upload Flow (Too Large)

```
1. User clicks "Select File"
2. Chooses 75 MB PDF file
3. ❌ Validation fails instantly
4. Error shown:
   "File validation failed:
   • File size exceeds maximum allowed size of 50MB"
5. File input cleared
6. Submit button disabled
7. User must select smaller file
```

---

## UI Components

### File Input Section

```tsx
<input
  type="file"
  accept=".pdf,.doc,.docx,.txt" // Browser filter
  onChange={handleFileChange} // Validates on selection
/>
```

**Shows**:

- ✅ Selected file name and size (if valid)
- ❌ Validation errors (if invalid)
- ℹ️ Help text: "Max size: 50 MB. Allowed: PDF, Word (.doc/.docx), Text (.txt)"

### Validation Error Display

```tsx
{
  fileValidationErrors.length > 0 && (
    <div className="bg-red-50 border border-red-200 text-red-700">
      <p className="font-semibold">File validation failed:</p>
      <ul className="list-disc list-inside">
        {fileValidationErrors.map((err) => (
          <li key={err}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Submit Button

```tsx
<Button disabled={loading || fileValidationErrors.length > 0 || !file}>
  Upload Document
</Button>
```

**Disabled when**:

- No file selected
- File has validation errors
- Upload in progress

---

## Validation Functions

### Core Functions

**File**: `app/lib/storage/file-validation.ts`

#### 1. `validateFile(filename, mimeType, fileSize)`

Complete validation that checks all rules.

```typescript
validateFile(
  "document.pdf",
  "application/pdf",
  1024000, // 1 MB
);
// Returns: { valid: true, errors: [] }

validateFile("image.png", "image/png", 500000);
// Returns: {
//   valid: false,
//   errors: ["File type not allowed. Allowed types: PDF Document, Word Document, Text File"]
// }
```

#### 2. `validateFilename(filename)`

Checks filename validity.

```typescript
validateFilename("report.pdf");
// Returns: { valid: true }

validateFilename("../etc/passwd");
// Returns: { valid: false, error: "Filename contains invalid characters" }
```

#### 3. `validateMimeType(mimeType)`

Checks if MIME type is allowed.

```typescript
validateMimeType("application/pdf");
// Returns: { valid: true }

validateMimeType("image/jpeg");
// Returns: { valid: false, error: "File type not allowed..." }
```

#### 4. `validateFileSize(fileSize)`

Checks file size constraints.

```typescript
validateFileSize(1024000); // 1 MB
// Returns: { valid: true }

validateFileSize(60000000); // 60 MB
// Returns: { valid: false, error: "File size exceeds maximum allowed size of 50MB" }

validateFileSize(0); // Empty file
// Returns: { valid: false, error: "File is empty" }
```

### Helper Functions

#### `formatFileSize(bytes)`

Formats bytes into human-readable format.

```typescript
formatFileSize(1024); // "1 KB"
formatFileSize(1048576); // "1 MB"
formatFileSize(52428800); // "50 MB"
```

#### `getMaxFileSize()`

Gets maximum allowed file size in bytes.

```typescript
getMaxFileSize(); // Returns: 52428800 (50 MB)
```

#### `getAllowedFileExtensions()`

Gets allowed extensions for HTML file input.

```typescript
getAllowedFileExtensions(); // Returns: ".pdf,.doc,.docx,.txt"
```

#### `getAllowedMimeTypes()`

Gets array of allowed MIME types.

```typescript
getAllowedMimeTypes();
// Returns: [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain"
// ]
```

---

## Security Considerations

### ✅ Security Features

1. **Whitelist Approach**: Only explicitly allowed types accepted
2. **Filename Sanitization**: Path traversal attempts blocked
3. **Size Limits**: Prevents DoS via large files
4. **Dual Validation**: Client + server validation
5. **MIME Type Checking**: File extension alone is not trusted

### ⚠️ Known Limitations

1. **MIME Type Spoofing**: Browser provides MIME type, can be spoofed
   - **Mitigation**: Server validates MIME type again
   - **Future**: Add magic byte validation

2. **File Content**: No deep content inspection
   - **Mitigation**: GridFS storage isolates files
   - **Future**: Add virus scanning

3. **Malicious PDFs**: PDFs can contain scripts
   - **Mitigation**: Files served with appropriate headers
   - **Future**: PDF sanitization layer

### 🔐 Best Practices

1. **Always validate on server**: Never trust client validation alone
2. **Use Content-Type headers**: Serve files with correct MIME types
3. **Sandbox file storage**: Store in isolated storage (GridFS)
4. **Scan for viruses**: Consider adding antivirus scanning in production
5. **Audit uploads**: Log all upload attempts with user info

---

## Troubleshooting

### Issue: Valid file rejected

**Symptoms**: PDF file rejected as invalid

**Possible Causes**:

1. File extension doesn't match content
2. MIME type not recognized
3. File corrupted

**Solution**:

```bash
# Check file type
file document.pdf

# Should show:
# document.pdf: PDF document, version 1.4

# If shows something else, file may be corrupted or misnamed
```

### Issue: File too large but under 50MB

**Symptoms**: 40 MB file rejected as too large

**Possible Causes**:

1. `MAX_FILE_SIZE_MB` environment variable set lower
2. Browser or network limitation

**Solution**:

```bash
# Check environment variable
echo $MAX_FILE_SIZE_MB

# Update if needed
MAX_FILE_SIZE_MB=50  # in .env file
```

### Issue: All files rejected

**Symptoms**: Every file shows validation error

**Possible Causes**:

1. JavaScript error in validation logic
2. Browser compatibility issue

**Solution**:

1. Check browser console for errors
2. Try different browser
3. Check `validateFile` function is imported correctly

---

## Testing Guide

### Test Case 1: Valid PDF Upload

```
1. Select valid PDF file (< 50 MB)
2. Expected: File accepted, name shown
3. Expected: Submit button enabled
4. Click Upload
5. Expected: Upload succeeds
```

### Test Case 2: Invalid File Type (Image)

```
1. Select PNG image file
2. Expected: Error shown immediately
3. Expected: "File type not allowed. Allowed types: PDF Document, Word Document, Text File"
4. Expected: File input cleared
5. Expected: Submit button disabled
```

### Test Case 3: File Too Large

```
1. Create file > 50 MB
2. Select the file
3. Expected: Error shown
4. Expected: "File size exceeds maximum allowed size of 50MB"
5. Expected: Submit button disabled
```

### Test Case 4: Empty File

```
1. Create 0-byte file
2. Select the file
3. Expected: Error shown
4. Expected: "File is empty"
```

### Test Case 5: Invalid Filename

```
1. Create file named "../../../etc/passwd.pdf"
2. Select the file
3. Expected: Error shown
4. Expected: "Filename contains invalid characters"
```

### Test Case 6: Word Document (.docx)

```
1. Select valid .docx file
2. Expected: File accepted
3. Click Upload
4. Expected: Upload succeeds
```

---

## Future Enhancements

### Priority 1: Enhanced Security

- [ ] Magic byte validation (check file signature)
- [ ] Virus/malware scanning integration
- [ ] PDF sanitization (remove scripts)
- [ ] Content-based validation (parse and verify)

### Priority 2: Additional File Types

- [ ] Excel spreadsheets (.xls, .xlsx)
- [ ] PowerPoint presentations (.ppt, .pptx)
- [ ] Markdown files (.md)
- [ ] Images (with size restrictions)

### Priority 3: UX Improvements

- [ ] Drag-and-drop file upload
- [ ] Multiple file upload
- [ ] Upload progress bar
- [ ] File preview before upload

### Priority 4: Advanced Features

- [ ] Automatic format conversion
- [ ] OCR for scanned PDFs
- [ ] Document compression
- [ ] Metadata extraction

---

## Configuration

### Environment Variables

```env
# Maximum file size in megabytes
MAX_FILE_SIZE_MB=50
```

### Modifying Allowed Types

**File**: `app/lib/storage/file-validation.ts`

To add new file type:

```typescript
// 1. Add MIME type to array
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel", // NEW: Excel
];

// 2. Add extension mapping
const MIME_TO_EXTENSION: Record<string, string> = {
  // ... existing mappings
  "application/vnd.ms-excel": "xls", // NEW
};

// 3. Add human-readable name
const MIME_TYPE_NAMES: Record<string, string> = {
  // ... existing names
  "application/vnd.ms-excel": "Excel Spreadsheet", // NEW
};

// 4. Update getAllowedFileExtensions()
export function getAllowedFileExtensions(): string {
  return ".pdf,.doc,.docx,.txt,.xls"; // Added .xls
}
```

---

## API Reference

### Request Format

```http
POST /api-client/documents
Content-Type: multipart/form-data

file: [binary file data]
title: "Document Title"
metadata: {"description": "...", "tags": [...]}
```

### Success Response

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Document Title",
    "filename": "document.pdf",
    "size": 1048576,
    "status": "PENDING",
    "createdAt": "2025-12-02T00:00:00.000Z"
  }
}
```

### Validation Error Response

```json
{
  "error": "File validation failed",
  "details": [
    "File type not allowed. Allowed types: PDF Document, Word Document, Text File"
  ]
}
```

---

## Summary

The file validation system provides:

✅ **Client-Side Validation**: Instant feedback, better UX
✅ **Server-Side Validation**: Security, cannot be bypassed
✅ **Clear Error Messages**: Users know exactly what's wrong
✅ **Multiple Validation Rules**: Filename, type, and size
✅ **Configurable Limits**: Easy to adjust max file size
✅ **Type Safety**: TypeScript ensures correct usage

**Status**: ✅ Fully implemented and production-ready

---

**Last Updated**: December 2, 2025
**Author**: Claude Code (Anthropic)
