import { Trash2, Sparkles } from 'lucide-react';
import type { Outfit } from '../types';
import { resolveImageUrl } from '../api/client';

const CAT_EMOJI: Record<string, string> = {
  superior: '👕', inferior: '👖', calzado: '👟',
  exterior: '🧥', accesorio: '👜', conjunto: '🩱',
};

const ESTILO_COLOR: Record<string, string> = {
  casual: 'bg-blue-100 text-blue-700',
  formal: 'bg-slate-100 text-slate-700',
  deportivo: 'bg-green-100 text-green-700',
  elegante: 'bg-purple-100 text-purple-700',
  bohemio: 'bg-amber-100 text-amber-700',
  streetwear: 'bg-orange-100 text-orange-700',
  vintage: 'bg-rose-100 text-rose-700',
};

interface Props {
  outfit: Outfit;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function OutfitCard({ outfit, onDelete, compact }: Props) {
  const estilos = [...new Set(outfit.prendas.map((p) => p.estilo))];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={15} className="text-violet-500 shrink-0" />
          <span className="font-semibold text-gray-800 capitalize truncate">{outfit.ocasion}</span>
          <div className="flex gap-1 shrink-0">
            {estilos.slice(0, 2).map((e) => (
              <span key={e} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTILO_COLOR[e] ?? 'bg-gray-100 text-gray-600'}`}>
                {e}
              </span>
            ))}
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(outfit._id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-2"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Prendas */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {outfit.prendas.map((prenda) => (
            <div key={prenda._id} className="shrink-0 w-20">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={resolveImageUrl(prenda.imageUrl)}
                  alt={prenda.subcategoria}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 left-0.5 text-sm leading-none">
                  {CAT_EMOJI[prenda.categoria] ?? '👗'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-1 text-center">{prenda.subcategoria}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: prenda.color_principal }}
                />
                <span className="text-xs text-gray-400 truncate">{prenda.color_principal}</span>
              </div>
            </div>
          ))}
        </div>

        {!compact && (
          <div className="mt-3 p-3 bg-violet-50 rounded-xl">
            <p className="text-sm text-violet-700 leading-relaxed">{outfit.justificacion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
