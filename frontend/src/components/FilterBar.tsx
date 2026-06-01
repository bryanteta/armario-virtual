import type { Categoria, Estilo, Temporada } from '../types';

const CATEGORIAS: { value: Categoria | 'todas'; label: string; emoji: string }[] = [
  { value: 'todas', label: 'Todas', emoji: '👚' },
  { value: 'superior', label: 'Superior', emoji: '👕' },
  { value: 'inferior', label: 'Inferior', emoji: '👖' },
  { value: 'calzado', label: 'Calzado', emoji: '👟' },
  { value: 'exterior', label: 'Exterior', emoji: '🧥' },
  { value: 'accesorio', label: 'Accesorio', emoji: '👜' },
  { value: 'conjunto', label: 'Conjunto', emoji: '🩱' },
];

const ESTILOS: { value: Estilo | ''; label: string }[] = [
  { value: '', label: 'Todos los estilos' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'elegante', label: 'Elegante' },
  { value: 'bohemio', label: 'Bohemio' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'vintage', label: 'Vintage' },
];

const TEMPORADAS: { value: Temporada | ''; label: string }[] = [
  { value: '', label: 'Todas las temporadas' },
  { value: 'primavera', label: '🌸 Primavera' },
  { value: 'verano', label: '☀️ Verano' },
  { value: 'otoño', label: '🍂 Otoño' },
  { value: 'invierno', label: '❄️ Invierno' },
  { value: 'todo', label: '🌍 Todo el año' },
];

interface Props {
  categoria: Categoria | 'todas';
  estilo: Estilo | '';
  temporada: Temporada | '';
  total: number;
  onCategoria: (c: Categoria | 'todas') => void;
  onEstilo: (e: Estilo | '') => void;
  onTemporada: (t: Temporada | '') => void;
}

export function FilterBar({ categoria, estilo, temporada, total, onCategoria, onEstilo, onTemporada }: Props) {
  return (
    <div className="space-y-3 mb-6">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIAS.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoria(c.value as Categoria | 'todas')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
              categoria === c.value
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700'
            }`}
          >
            <span>{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <select
          value={estilo}
          onChange={(e) => onEstilo(e.target.value as Estilo | '')}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-600"
        >
          {ESTILOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>

        <select
          value={temporada}
          onChange={(e) => onTemporada(e.target.value as Temporada | '')}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-600"
        >
          {TEMPORADAS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <span className="text-sm text-gray-400 ml-auto">
          {total} {total === 1 ? 'prenda' : 'prendas'}
        </span>
      </div>
    </div>
  );
}
