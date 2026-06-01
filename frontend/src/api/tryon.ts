import { post } from './client';
import type { ApiResponse } from '../types';

interface TryOnResult {
  outputImageUrl: string;
  clothingId: string;
  modelImageUrl: string;
}

export async function runTryOn(
  clothingId: string,
  modelImageUrl: string
): Promise<ApiResponse<TryOnResult>> {
  return post('/try-on', { clothingId, modelImageUrl });
}
