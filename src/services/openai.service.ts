import OpenAI from 'openai';
import type { ClothingLabels } from '../types';
import type { IClothingItem } from '../models/ClothingItem';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment variables');
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

const CLOTHING_LABELS_PROMPT = `Analiza esta prenda de ropa y devuelve un JSON con exactamente estos campos:
{
  "categoria": uno de ["superior","inferior","calzado","accesorio","conjunto","exterior"],
  "subcategoria": string descriptivo (ej: "camiseta manga larga", "pantalón vaquero", "zapatilla deportiva"),
  "color_principal": color dominante en español (ej: "azul marino", "blanco", "negro"),
  "colores_secundarios": array de otros colores presentes [],
  "estilo": uno de ["casual","formal","deportivo","elegante","bohemio","streetwear","vintage"],
  "temporada": uno de ["primavera","verano","otoño","invierno","todo"]
}
Responde SOLO con el JSON válido, sin texto adicional.`;

export async function extractClothingLabels(imageUrl: string): Promise<ClothingLabels> {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'low' },
          },
          {
            type: 'text',
            text: CLOTHING_LABELS_PROMPT,
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('OpenAI returned empty response for clothing analysis');

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

  let parsed: ClothingLabels;
  try {
    parsed = JSON.parse(jsonStr) as ClothingLabels;
  } catch {
    throw new Error(`Could not parse OpenAI response as JSON: ${raw}`);
  }

  return parsed;
}

interface OutfitSuggestion {
  prendas: string[];
  justificacion: string;
}

export async function generateOutfitSuggestions(
  ocasion: string,
  inventory: IClothingItem[]
): Promise<OutfitSuggestion[]> {
  const inventoryDescription = inventory
    .map(
      (item) =>
        `ID: ${item._id} | ${item.subcategoria} | Color: ${item.color_principal} | Estilo: ${item.estilo} | Temporada: ${item.temporada}`
    )
    .join('\n');

  const prompt = `Eres un estilista personal experto. El usuario tiene el siguiente inventario de ropa:

${inventoryDescription}

Genera exactamente 3 outfits completos para la ocasión: "${ocasion}".

Devuelve un JSON con este formato exacto:
[
  {
    "prendas": ["<ID_MONGODB_1>", "<ID_MONGODB_2>", ...],
    "justificacion": "Explicación breve de por qué este outfit es ideal"
  },
  ...
]

IMPORTANTE:
- Usa SOLO los IDs tal como aparecen en el inventario
- Cada outfit debe incluir prendas que combinen entre sí
- Considera la ocasión, el estilo y la temporada
- Responde SOLO con el JSON válido, sin texto adicional`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error('OpenAI returned empty response for outfit generation');

  const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');

  let suggestions: OutfitSuggestion[];
  try {
    suggestions = JSON.parse(jsonStr) as OutfitSuggestion[];
  } catch {
    throw new Error(`Could not parse OpenAI outfit suggestions as JSON: ${raw}`);
  }

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error('OpenAI returned invalid outfit suggestions format');
  }

  return suggestions;
}
