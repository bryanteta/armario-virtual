import type { Request, Response, NextFunction } from 'express';
import { ClothingItem } from '../models/ClothingItem';
import { runVirtualTryOn } from '../services/fal.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiResponse } from '../types';

interface TryOnBody {
  clothingId?: string;
  modelImageUrl?: string;
}

interface TryOnResult {
  outputImageUrl: string;
  clothingId: string;
  modelImageUrl: string;
}

export async function tryOn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { clothingId, modelImageUrl } = req.body as TryOnBody;
    const userId = req.userId!;

    if (!clothingId || typeof clothingId !== 'string') {
      throw new AppError(400, 'Field "clothingId" is required');
    }

    if (!modelImageUrl || typeof modelImageUrl !== 'string') {
      throw new AppError(400, 'Field "modelImageUrl" is required');
    }

    try { new URL(modelImageUrl); } catch {
      throw new AppError(400, '"modelImageUrl" must be a valid URL');
    }

    const clothingItem = await ClothingItem.findOne({ _id: clothingId, userId });
    if (!clothingItem) throw new AppError(404, 'Clothing item not found');

    const outputImageUrl = await runVirtualTryOn(
      modelImageUrl,
      clothingItem.imageUrl,
      clothingItem.categoria
    );

    const body: ApiResponse<TryOnResult> = {
      success: true,
      data: { outputImageUrl, clothingId, modelImageUrl },
      message: 'Virtual try-on completed successfully',
    };

    res.json(body);
  } catch (err) {
    next(err);
  }
}
