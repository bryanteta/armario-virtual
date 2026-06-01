import { get, post, del } from './client';
import type { ApiResponse } from '../types';
import type { Outfit } from '../types';

export interface CalendarEntry {
  _id: string;
  date: string;
  outfitId: Outfit;
  notas: string;
}

export async function fetchMonth(month: string): Promise<ApiResponse<CalendarEntry[]>> {
  return get(`/calendar?month=${month}`);
}

export async function assignOutfit(date: string, outfitId: string, notas = ''): Promise<ApiResponse<CalendarEntry>> {
  return post('/calendar', { date, outfitId, notas });
}

export async function removeEntry(date: string): Promise<ApiResponse<null>> {
  return del(`/calendar/${date}`);
}
