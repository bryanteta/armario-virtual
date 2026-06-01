import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { buildPublicUrl } from '../services/storage.service';
import type { ApiResponse } from '../types';

export async function uploadModelPhoto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) throw new AppError(400, 'No image file provided');

    const imageUrl = buildPublicUrl(req.file.filename);

    const body: ApiResponse<{ imageUrl: string }> = {
      success: true,
      data: { imageUrl },
      message: 'Model photo uploaded successfully',
    };

    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}
