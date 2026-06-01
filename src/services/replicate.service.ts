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

function extractUrl(output: unknown): string {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && output.length > 0) return String(output[0]);
  if (output && typeof (output as Record<string, unknown>).url === 'function') {
    return String((output as Record<string, () => string>).url());
  }
  throw new Error('Unexpected output format from Replicate');
}

// Removes background from clothing image — cjwbw/rembg
export async function removeBackground(imageUrl: string): Promise<string> {
  const output = await getClient().run('cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003', {
    input: { image: imageUrl },
  });
  return extractUrl(output);
}

// Virtual try-on — kept for future use when a stable model is available
export async function runVirtualTryOn(
  _garmentImageUrl: string,
  _modelImageUrl: string,
  _garmentDescription: string
): Promise<string> {
  throw new Error('El modelo de prueba virtual no está disponible actualmente en Replicate. Usa la eliminación de fondo como alternativa.');
}
