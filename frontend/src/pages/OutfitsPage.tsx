import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import { OutfitCard } from '../components/OutfitCard';
import { CombinationPicker } from '../components/CombinationPicker';
import { fetchOutfits, generateOutfits, deleteOutfit } from '../api/outfits';
import type { Outfit, Categoria, Estilo } from '../types';

const OCASIONES = [
  'Trabajo en oficina',
  'Cita romántica',
  'Día casual',
  'Evento formal',
  'Deporte y gym',
  'Salida con amigos',
  'Viaje',
  'Playa',
];

export function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [ocasion, setOcasion] = useState('');
  const [custom, setCustom] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>(['superior', 'inferior', 'calzado']);
  const [estilo, setEstilo] = useState<Estilo | ''>('');
  const [filterOcasion, setFilterOcasion] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetchOutfits();
      setOutfits(res.data ?? []);
    } catch {
      toast.error('Error cargando los outfits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    const value = ocasion.trim();
    if (!value) return toast.error('Elige o escribe una ocasión');
    if (categorias.length === 0) return toast.error('Selecciona al menos una categoría');

    setGenerating(true);
    try {
      const res = await generateOutfits(value, categorias, estilo || undefined);
      if (res.data) {
        setOutfits((prev) => [...(res.data ?? []), ...prev]);
        toast.success(`${res.data.length} outfits generados`);
        setOcasion('');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error generando outfits');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o._id !== id));
      toast.success('Outfit eliminado');
    } catch {
      toast.error('Error eliminando el outfit');
    }
  };

  const filtered = filterOcasion
    ? outfits.filter((o) => o.ocasion.toLowerCase().includes(filterOcasion.toLowerCase()))
    : outfits;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Generador de Outfits</h1>
        <p className="text-gray-500 mt-1">La IA combinará tus prendas para cada ocasión</p>
      </div>

      {/* Generator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Wand2 size={18} className="text-violet-500" />
          ¿Para qué ocasión?
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {OCASIONES.map((o) => (
            <button
              key={o}
              onClick={() => { setOcasion(o); setCustom(false); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                ocasion === o && !custom
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700'
              }`}
            >
              {o}
            </button>
          ))}
          <button
            onClick={() => { setCustom(true); setOcasion(''); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              custom ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-violet-100'
            }`}
          >
            Otra...
          </button>
        </div>

        {custom && (
          <input
            type="text"
            value={ocasion}
            onChange={(e) => setOcasion(e.target.value)}
            placeholder="Describe la ocasión..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 mb-4"
            autoFocus
          />
        )}

        {/* Advanced: combination picker */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 mb-3 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {showAdvanced ? 'Ocultar opciones' : 'Personalizar combinación y estilo'}
        </button>

        {showAdvanced && (
          <div className="border border-gray-100 rounded-2xl p-4 mb-4 bg-gray-50">
            <CombinationPicker
              categorias={categorias}
              estilo={estilo}
              onChange={setCategorias}
              onEstilo={setEstilo}
            />
          </div>
        )}

        {/* Summary of selection */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categorias.map((c) => (
              <span key={c} className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-medium capitalize">
                {c}
              </span>
            ))}
            {estilo && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-medium capitalize">
                estilo: {estilo}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !ocasion.trim()}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {generating ? (
            <><Loader2 size={18} className="animate-spin" /> Generando 3 outfits...</>
          ) : (
            <><Sparkles size={18} /> Generar outfits con IA</>
          )}
        </button>
      </div>

      {/* Filter + list */}
      {outfits.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={filterOcasion}
            onChange={(e) => setFilterOcasion(e.target.value)}
            placeholder="Filtrar por ocasión..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
          <span className="text-sm text-gray-400 shrink-0">{filtered.length} outfits</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg">
            {filterOcasion ? 'Sin outfits para ese filtro' : 'Aún no hay outfits generados'}
          </p>
          <p className="text-gray-300 text-sm mt-1">Necesitas al menos 2 prendas en el armario</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((outfit) => (
            <OutfitCard key={outfit._id} outfit={outfit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
