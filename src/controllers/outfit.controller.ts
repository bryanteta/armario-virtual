import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Outfit } from '../models/Outfit';
import { ClothingItem } from '../models/ClothingItem';
import { generateOutfitSuggestions } from '../services/openai.service';
import { AppError } from '../middleware/errorHandler';
import type { ApiResponse, PaginatedResponse } from '../types';
import type { IOutfit } from '../models/Outfit';

export async function generateOutfits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ocasion, categorias, estilo } = req.body as { ocasion?: string; categorias?: string[]; estilo?: string };
    const userId = req.userId!;

    if (!ocasion || typeof ocasion !== 'string' || ocasion.trim() === '') {
      throw new AppError(400, 'Field "ocasion" is required');
    }

    const inventory = await ClothingItem.find({ userId }).lean();
    if (inventory.length < 2) {
      throw new AppError(422, 'You need at least 2 clothing items to generate an outfit');
    }

    const suggestions = await generateOutfitSuggestions(ocasion.trim(), inventory as never, categorias, estilo);

    const outfits = await Promise.all(
      suggestions.map(async (s) => {
        const validIds = s.prendas
          .filter((id) => Types.ObjectId.isValid(id))
          .map((id) => new Types.ObjectId(id));

        if (validIds.length === 0) {
          throw new AppError(500, 'AI returned outfit with no valid clothing IDs');
        }

        return Outfit.create({
          userId,
          prendas: validIds,
          ocasion: ocasion.trim(),
          justificacion: s.justificacion,
        });
      })
    );

    const populated = await Outfit.find({
      _id: { $in: outfits.map((o) => o._id) },
    }).populate('prendas');

    const body: ApiResponse<IOutfit[]> = {
      success: true,
      data: populated as IOutfit[],
      message: `Generated ${populated.length} outfit(s) for "${ocasion}"`,
    };

    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

export async function getOutfits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [outfits, total] = await Promise.all([
      Outfit.find({ userId })
        .populate('prendas')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Outfit.countDocuments({ userId }),
    ]);

    const body: PaginatedResponse<IOutfit> = {
      success: true,
      data: outfits as unknown as IOutfit[],
      total,
      page,
      limit,
    };

    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function getOutfitById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const outfit = await Outfit.findOne({ _id: id, userId }).populate('prendas').lean();
    if (!outfit) throw new AppError(404, 'Outfit not found');

    const body: ApiResponse<IOutfit> = { success: true, data: outfit as unknown as IOutfit };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

export async function deleteOutfit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const outfit = await Outfit.findOneAndDelete({ _id: id, userId });
    if (!outfit) throw new AppError(404, 'Outfit not found');

    const body: ApiResponse = { success: true, message: 'Outfit deleted' };
    res.json(body);
  } catch (err) {
    next(err);
  }
}
