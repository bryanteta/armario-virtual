import { removeBackground } from '@imgly/background-removal';
import { post, postForm } from './client';
import type { ApiResponse } from '../types';
import type { ClothingItem } from '../types';

async function blobToFile(blob: Blob, filename: string): Promise<File> {
  return new File([blob], filename, { type: 'image/png' });
}

async function uploadProcessedImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);
  const res = await postForm<ApiResponse<{ imageUrl: string }>>('/uploads/model-photo', form);
  if (!res.data?.imageUrl) throw new Error('Upload failed');
  return res.data.imageUrl;
}

export async function removeBgAndSave(
  item: ClothingItem,
  onProgress?: (msg: string) => void
): Promise<ClothingItem> {
  onProgress?.('Descargando imagen...');
  const blob = await removeBackground(item.imageUrl, {
    publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
    progress: (key, current, total) => {
      if (key === 'compute:inference') {
        onProgress?.(`Procesando: ${Math.round((current / total) * 100)}%`);
      }
    },
  });

  onProgress?.('Subiendo resultado...');
  const file = await blobToFile(blob, `${item._id}-nobg.png`);
  const newUrl = await uploadProcessedImage(file);

  onProgress?.('Guardando...');
  const res = await post<ApiResponse<ClothingItem>>(`/clothing/${item._id}/image-url`, {
    imageUrl: newUrl,
  });

  if (!res.data) throw new Error('Failed to update clothing item');
  return res.data;
}
