import { get, post, del } from './client';
import type { Outfit, PaginatedResponse, ApiResponse } from '../types';

export async function fetchOutfits(page = 1): Promise<PaginatedResponse<Outfit>> {
  return get(`/outfits?page=${page}&limit=20`);
}

export async function generateOutfits(ocasion: string): Promise<ApiResponse<Outfit[]>> {
  return post('/outfits/generate', { ocasion });
}

export async function deleteOutfit(id: string): Promise<ApiResponse<null>> {
  return del(`/outfits/${id}`);
}
