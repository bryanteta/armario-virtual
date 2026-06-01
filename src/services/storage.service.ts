import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Returns the public URL path for a saved file.
// In production replace with S3/GCS signed URL logic.
export function buildPublicUrl(filename: string): string {
  const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  return `${baseUrl}/uploads/${filename}`;
}

export function generateFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  return `${uuidv4()}${ext}`;
}
