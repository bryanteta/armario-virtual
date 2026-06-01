import { Client } from '@gradio/client';
import type { Categoria } from '../types';

// IDM-VTON hosted on HuggingFace Spaces — free, no credits needed
const HF_SPACE = 'yisol/IDM-VTON';

async function urlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  return res.blob();
}

function mapCategoria(categoria: Categoria): string {
  const map: Partial<Record<Categoria, string>> = {
    superior: 'upper_body',
    exterior: 'upper_body',
    inferior: 'lower_body',
    conjunto: 'dresses',
  };
  return map[categoria] ?? 'upper_body';
}

export async function runVirtualTryOn(
  modelImageUrl: string,
  garmentImageUrl: string,
  categoria: Categoria
): Promise<string> {
  const hfToken = process.env.HF_TOKEN;

  const client = await Client.connect(HF_SPACE, {
    token: hfToken as `hf_${string}` | undefined,
  });

  const [modelBlob, garmentBlob] = await Promise.all([
    urlToBlob(modelImageUrl),
    urlToBlob(garmentImageUrl),
  ]);

  const result = await client.predict('/tryon', {
    dict: { background: modelBlob, layers: [], composite: null },
    garm_img: garmentBlob,
    garment_des: mapCategoria(categoria),
    is_checked: true,
    is_checked_crop: false,
    denoise_steps: 30,
    seed: 42,
  });

  const data = result.data as Array<{ url?: string; path?: string } | null>;
  const img = data[0];
  const url = img?.url ?? img?.path;

  if (!url) throw new Error('IDM-VTON no devolvió imagen. El Space puede estar en cola — reintenta en un momento.');

  return url;
}
