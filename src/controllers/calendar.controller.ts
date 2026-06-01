import type { Request, Response, NextFunction } from 'express';
import { CalendarEntry } from '../models/CalendarEntry';
import { Outfit } from '../models/Outfit';
import { AppError } from '../middleware/errorHandler';
import type { ApiResponse } from '../types';
import type { ICalendarEntry } from '../models/CalendarEntry';

// GET /api/calendar?month=2026-06
export async function getMonthEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const month = req.query.month as string; // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError(400, 'Query param "month" must be in format YYYY-MM');
    }

    const entries = await CalendarEntry.find({
      userId,
      date: { $regex: `^${month}` },
    })
      .populate({ path: 'outfitId', populate: { path: 'prendas' } })
      .sort({ date: 1 })
      .lean();

    const body: ApiResponse<ICalendarEntry[]> = { success: true, data: entries as unknown as ICalendarEntry[] };
    res.json(body);
  } catch (err) {
    next(err);
  }
}

// POST /api/calendar
export async function assignOutfit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { date, outfitId, notas } = req.body as { date?: string; outfitId?: string; notas?: string };

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError(400, 'Field "date" must be in format YYYY-MM-DD');
    }
    if (!outfitId) throw new AppError(400, 'Field "outfitId" is required');

    const outfit = await Outfit.findOne({ _id: outfitId, userId });
    if (!outfit) throw new AppError(404, 'Outfit not found');

    const entry = await CalendarEntry.findOneAndUpdate(
      { userId, date },
      { outfitId, notas: notas ?? '' },
      { upsert: true, new: true }
    ).populate({ path: 'outfitId', populate: { path: 'prendas' } });

    const body: ApiResponse<ICalendarEntry> = {
      success: true,
      data: entry as unknown as ICalendarEntry,
      message: `Outfit asignado al ${date}`,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/calendar/:date
export async function removeEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const { date } = req.params;

    const entry = await CalendarEntry.findOneAndDelete({ userId, date });
    if (!entry) throw new AppError(404, 'No entry for this date');

    res.json({ success: true, message: `Outfit eliminado del ${date}` });
  } catch (err) {
    next(err);
  }
}
