import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import type { Request } from 'express';
import { generateFilename, ensureUploadDir } from '../services/storage.service';
import { AppError } from './errorHandler';

ensureUploadDir();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, generateFilename(file.originalname)),
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(415, `Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});
