import { Trash2, Sparkles } from 'lucide-react';
import type { Outfit } from '../types';

interface Props {
  outfit: Outfit;
  onDelete?: (id: string) => void;
}

export function OutfitCard({ outfit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-violet-500" />
          <span className="font-semibold text-gray-800 capitalize">{outfit.ocasion}</span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(outfit._id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {outfit.prendas.map((prenda) => (
            <div key={prenda._id} className="shrink-0 w-20">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={prenda.imageUrl}
                  alt={prenda.subcategoria}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 truncate mt-1 text-center">{prenda.subcategoria}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-violet-50 rounded-xl">
          <p className="text-sm text-violet-700 leading-relaxed">{outfit.justificacion}</p>
        </div>
      </div>
    </div>
  );
}
