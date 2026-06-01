import { get, postForm, del } from './client';
import type { ClothingItem, PaginatedResponse, ApiResponse } from '../types';

export async function fetchClothing(page = 1): Promise<PaginatedResponse<ClothingItem>> {
  return get(`/clothing?page=${page}&limit=20`);
}

export async function uploadClothing(file: File): Promise<ApiResponse<ClothingItem>> {
  const form = new FormData();
  form.append('image', file);
  return postForm('/clothing/upload', form);
}

export async function deleteClothing(id: string): Promise<ApiResponse<null>> {
  return del(`/clothing/${id}`);
}
