import { Trash2, Tag } from 'lucide-react';
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
  onSelect?: (item: ClothingItem) => void;
  selected?: boolean;
}

export function ClothingCard({ item, onDelete, onSelect, selected }: Props) {
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
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 shrink-0"
            >
              <Trash2 size={14} />
            </button>
          )}
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
