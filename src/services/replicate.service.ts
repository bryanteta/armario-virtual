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

// Removes background from clothing image — lucataco/remove-bg (BRIA RMBG 1.4)
export async function removeBackground(imageUrl: string): Promise<string> {
  const output = await getClient().run('lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285d65bf02a4ca5a3eed0a77ded', {
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
