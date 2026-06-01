import { Trash2, Tag, Eraser, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { ClothingItem } from '../types';
import { resolveImageUrl } from '../api/client';

const CATEGORIA_COLORS: Record<string, string> = {
  superior: 'bg-blue-100 text-blue-700',
  inferior: 'bg-green-100 text-green-700',
  calzado: 'bg-orange-100 text-orange-700',
  accesorio: 'bg-pink-100 text-pink-700',
  conjunto: 'bg-purple-100 text-purple-700',
  exterior: 'bg-gray-100 text-gray-700',
};

interface Props {
  item: ClothingItem;
  onDelete?: (id: string) => void;
  onRemoveBg?: (id: string) => Promise<void>;
  onSelect?: (item: ClothingItem) => void;
  selected?: boolean;
}

export function ClothingCard({ item, onDelete, onRemoveBg, onSelect, selected }: Props) {
  const [removing, setRemoving] = useState(false);

  const handleRemoveBg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemoveBg) return;
    setRemoving(true);
    try { await onRemoveBg(item._id); } finally { setRemoving(false); }
  };

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`relative group rounded-2xl overflow-hidden bg-white shadow-sm border-2 transition-all duration-200 ${
        onSelect ? 'cursor-pointer hover:shadow-md' : ''
      } ${selected ? 'border-violet-500 shadow-violet-200' : 'border-transparent'}`}
    >
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={resolveImageUrl(item.imageUrl)}
          alt={item.subcategoria}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate capitalize">{item.subcategoria}</p>
            <div className="flex items-center gap-1 mt-1">
              <span
                className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
                style={{ backgroundColor: item.color_principal }}
              />
              <span className="text-xs text-gray-500 truncate">{item.color_principal}</span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {onRemoveBg && (
              <button
                onClick={handleRemoveBg}
                disabled={removing}
                title="Quitar fondo"
                className="p-1 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 disabled:opacity-50"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : <Eraser size={14} />}
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                title="Eliminar"
                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORIA_COLORS[item.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
            {item.categoria}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {item.temporada}
          </span>
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
          <Tag size={12} className="text-white" />
        </div>
      )}
    </div>
  );
}
