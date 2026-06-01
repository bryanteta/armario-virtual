import { fal } from '@fal-ai/client';
import type { Categoria } from '../types';

function getCategory(categoria: Categoria): 'tops' | 'bottoms' | 'one-pieces' {
  const map: Partial<Record<Categoria, 'tops' | 'bottoms' | 'one-pieces'>> = {
    superior: 'tops',
    exterior: 'tops',
    inferior: 'bottoms',
    conjunto: 'one-pieces',
  };
  return map[categoria] ?? 'tops';
}

interface TryOnResult {
  images: { url: string }[];
}

export async function runVirtualTryOn(
  modelImageUrl: string,
  garmentImageUrl: string,
  categoria: Categoria
): Promise<string> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error('FAL_KEY is not set in environment variables');

  fal.config({ credentials: apiKey });

  let result: { data: TryOnResult };
  try {
    result = await fal.subscribe('fashn/tryon', {
      input: {
        model_image: modelImageUrl,
        garment_image: garmentImageUrl,
        category: getCategory(categoria),
        garment_photo_type: 'auto',
        nsfw_filter: true,
      },
    }) as { data: TryOnResult };
  } catch (err: any) {
    const detail = err?.body?.detail ?? err?.message ?? String(err);
    console.error('[fal.ai error]', detail);
    throw new Error(`fal.ai error: ${detail}`);
  }

  const url = result.data?.images?.[0]?.url;
  if (!url) throw new Error('fal.ai did not return an image URL');

  return url;
}
