import type { Request, Response, NextFunction } from 'express';
import { ClothingItem } from '../models/ClothingItem';
import { extractClothingLabels } from '../services/openai.service';
import { buildPublicUrl } from '../services/storage.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiResponse, PaginatedResponse } from '../types';
import type { IClothingItem } from '../models/ClothingItem';

export async function uploadClothing(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError(400, 'No image file provided');
    }

    const userId = req.userId!;
    const imageUrl = buildPublicUrl(req.file.filename);

    const labels = await extractClothingLabels(imageUrl);

    const item = await ClothingItem.create({
      userId,
      imageUrl,
      ...labels,
    });

    const body: ApiResponse<IClothingItem> = {
      success: true,
      data: item,
      message: 'Clothing item uploaded and analysed successfully',
    };

    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getClothingItems(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (req.query.categoria) filter.categoria = req.query.categoria;
    if (req.query.estilo) filter.estilo = req.query.estilo;
    if (req.query.temporada) filter.temporada = req.query.temporada;

    const [items, total] = await Promise.all([
      ClothingItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ClothingItem.countDocuments(filter),
    ]);

    const body: PaginatedResponse<IClothingItem> = {
      success: true,
      data: items as unknown as IClothingItem[],
      total,
      page,
      limit,
    };

    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function getClothingItemById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const item = await ClothingItem.findOne({ _id: id, userId }).lean();
    if (!item) throw new AppError(404, 'Clothing item not found');

    const body: ApiResponse<IClothingItem> = { success: true, data: item as unknown as IClothingItem };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function removeClothingBackground(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const item = await ClothingItem.findOne({ _id: id, userId });
    if (!item) throw new AppError(404, 'Clothing item not found');

    const { removeImageBackground } = await import('../services/removebg.service');
    const newUrl = await removeImageBackground(item.imageUrl);

    item.imageUrl = newUrl;
    await item.save();

    const body: ApiResponse<IClothingItem> = {
      success: true,
      data: item,
      message: 'Background removed successfully',
    };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/clothing/:id/image-url — updates imageUrl after client-side bg removal
export async function updateClothingImageUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { imageUrl } = req.body as { imageUrl?: string };

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new AppError(400, 'Field "imageUrl" is required');
    }

    const item = await ClothingItem.findOneAndUpdate(
      { _id: id, userId },
      { imageUrl },
      { new: true }
    );
    if (!item) throw new AppError(404, 'Clothing item not found');

    const body: ApiResponse<IClothingItem> = { success: true, data: item };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteClothingItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const item = await ClothingItem.findOneAndDelete({ _id: id, userId });
    if (!item) throw new AppError(404, 'Clothing item not found');

    const body: ApiResponse = { success: true, message: 'Clothing item deleted' };
    res.json(body);
  } catch (err) {
    next(err);
  }
}
