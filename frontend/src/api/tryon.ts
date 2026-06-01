import { post, postForm } from './client';
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

export async function uploadModelPhoto(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
  const form = new FormData();
  form.append('image', file);
  return postForm('/uploads/model-photo', form);
}
