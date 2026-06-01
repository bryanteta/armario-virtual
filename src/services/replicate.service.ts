import Replicate from 'replicate';

let _replicate: Replicate | null = null;

function getClient(): Replicate {
  if (!_replicate) {
    const auth = process.env.REPLICATE_API_TOKEN;
    if (!auth) throw new Error('REPLICATE_API_TOKEN is not set in environment variables');
    _replicate = new Replicate({ auth });
  }
  return _replicate;
}

// cuuupid/idm-vton — virtual try-on model
const VTON_MODEL = 'cuuupid/idm-vton' as const;

interface VtonInput {
  garm_img: string;
  human_img: string;
  garment_des: string;
  is_checked: boolean;
  is_checked_crop: boolean;
  denoise_steps: number;
  seed: number;
}

export async function runVirtualTryOn(
  garmentImageUrl: string,
  modelImageUrl: string,
  garmentDescription: string
): Promise<string> {
  const input: VtonInput = {
    garm_img: garmentImageUrl,
    human_img: modelImageUrl,
    garment_des: garmentDescription,
    is_checked: true,
    is_checked_crop: false,
    denoise_steps: 30,
    seed: 42,
  };

  const output = await getClient().run(VTON_MODEL, { input });

  // The model returns a FileOutput or URL string
  if (Array.isArray(output) && output.length > 0) {
    return String(output[0]);
  }

  if (typeof output === 'string') {
    return output;
  }

  // Handle Replicate FileOutput objects
  if (output && typeof (output as Record<string, unknown>).url === 'function') {
    return String((output as Record<string, () => string>).url());
  }

  throw new Error('Unexpected output format from Replicate VTON model');
}
