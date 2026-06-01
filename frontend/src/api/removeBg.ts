import { post } from './client';
import type { ApiResponse } from '../types';
import type { ClothingItem } from '../types';

export async function removeBgAndSave(
  item: ClothingItem,
  onProgress?: (msg: string) => void
): Promise<ClothingItem> {
  onProgress?.('Eliminando fondo en el servidor...');
  const res = await post<ApiResponse<ClothingItem>>(`/clothing/${item._id}/remove-bg`, {});
  const updated = (res as ApiResponse<ClothingItem>).data;
  if (!updated) throw new Error('No se pudo eliminar el fondo');
  return updated;
}
