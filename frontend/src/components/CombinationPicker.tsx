import type { Categoria, Estilo } from '../types';

const CATS: { value: Categoria; label: string; emoji: string }[] = [
  { value: 'superior', label: 'Superior', emoji: '👕' },
  { value: 'inferior', label: 'Inferior', emoji: '👖' },
  { value: 'calzado', label: 'Calzado', emoji: '👟' },
  { value: 'exterior', label: 'Exterior', emoji: '🧥' },
  { value: 'accesorio', label: 'Accesorio', emoji: '👜' },
  { value: 'conjunto', label: 'Conjunto', emoji: '🩱' },
];

const ESTILOS: { value: Estilo; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'elegante', label: 'Elegante' },
  { value: 'bohemio', label: 'Bohemio' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'vintage', label: 'Vintage' },
];

const PRESETS: { label: string; cats: Categoria[] }[] = [
  { label: 'Look completo', cats: ['superior', 'inferior', 'calzado'] },
  { label: '+ Exterior', cats: ['superior', 'inferior', 'calzado', 'exterior'] },
  { label: 'Con accesorios', cats: ['superior', 'inferior', 'calzado', 'accesorio'] },
  { label: 'Conjunto', cats: ['conjunto', 'calzado'] },
];

interface Props {
  categorias: Categoria[];
  estilo: Estilo | '';
  onChange: (cats: Categoria[]) => void;
  onEstilo: (e: Estilo | '') => void;
}

export function CombinationPicker({ categorias, estilo, onChange, onEstilo }: Props) {
  const toggle = (cat: Categoria) => {
    onChange(
      categorias.includes(cat) ? categorias.filter((c) => c !== cat) : [...categorias, cat]
    );
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Combinación rápida</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = p.cats.length === categorias.length && p.cats.every((c) => categorias.includes(c));
            return (
              <button
                key={p.label}
                onClick={() => onChange(p.cats)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual toggle */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">O elige manualmente</p>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.value}
              onClick={() => toggle(c.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                categorias.includes(c.value)
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-500 hover:border-violet-300'
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estilo preferido (opcional)</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onEstilo('')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              estilo === '' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cualquiera
          </button>
          {ESTILOS.map((e) => (
            <button
              key={e.value}
              onClick={() => onEstilo(e.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                estilo === e.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
