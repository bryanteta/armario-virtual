import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Camera, Loader2, ImageIcon, CheckCircle2, Upload, UserRound } from 'lucide-react';
import { ClothingCard } from '../components/ClothingCard';
import { fetchClothing } from '../api/clothing';
import { runTryOn, uploadModelPhoto } from '../api/tryon';
import { resolveImageUrl } from '../api/client';
import type { ClothingItem } from '../types';

export function TryOnPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selected, setSelected] = useState<ClothingItem | null>(null);
  const [modelUrl, setModelUrl] = useState('');
  const [modelPreview, setModelPreview] = useState<string | null>(null);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchClothing();
      setItems(res.data ?? []);
    } catch {
      toast.error('Error cargando las prendas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleModelFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Solo se aceptan imágenes');
    setUploadingModel(true);
    setModelPreview(URL.createObjectURL(file));
    try {
      const res = await uploadModelPhoto(file);
      if (res.data) {
        setModelUrl(res.data.imageUrl);
        toast.success('Foto subida correctamente');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error subiendo la foto');
      setModelPreview(null);
    } finally {
      setUploadingModel(false);
    }
  };

  const handleTryOn = async () => {
    if (!selected) return toast.error('Selecciona una prenda');
    if (!modelUrl) return toast.error('Sube tu foto primero');

    setRunning(true);
    setResult(null);
    try {
      const res = await runTryOn(selected._id, modelUrl);
      if (res.data) {
        setResult(res.data.outputImageUrl);
        toast.success('¡Prueba virtual completada!');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error en el probador virtual');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Probador Virtual</h1>
        <p className="text-gray-500 mt-1">Sube tu foto y pruébate cualquier prenda con IA</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">

          {/* Paso 1 — Tu foto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">1</span>
              Tu foto
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleModelFile(e.target.files[0])}
            />

            {modelPreview ? (
              <div className="relative">
                <img
                  src={modelPreview}
                  alt="Tu foto"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-xs font-medium px-3 py-1.5 rounded-lg shadow hover:bg-white transition-colors"
                >
                  Cambiar foto
                </button>
                {uploadingModel && (
                  <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                    <Loader2 className="animate-spin text-violet-500" />
                  </div>
                )}
                {modelUrl && !uploadingModel && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/50 transition-all"
              >
                {uploadingModel ? (
                  <Loader2 size={32} className="mx-auto text-violet-400 animate-spin mb-2" />
                ) : (
                  <UserRound size={32} className="mx-auto text-gray-300 mb-2" />
                )}
                <p className="text-sm font-medium text-gray-600">
                  {uploadingModel ? 'Subiendo...' : 'Sube tu foto'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Foto de cuerpo completo, fondo liso</p>
              </div>
            )}
          </div>

          {/* Paso 2 — Prenda */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">2</span>
              Selecciona una prenda
            </h2>

            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No hay prendas en el armario</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <ClothingCard
                    key={item._id}
                    item={item}
                    onSelect={setSelected}
                    selected={selected?._id === item._id}
                  />
                ))}
              </div>
            )}

            {selected && (
              <div className="mt-3 flex items-center gap-2 text-sm text-violet-700 bg-violet-50 rounded-xl p-2">
                <CheckCircle2 size={15} />
                <span className="font-medium">{selected.subcategoria}</span> seleccionada
              </div>
            )}
          </div>

          <button
            onClick={handleTryOn}
            disabled={running || !selected || !modelUrl}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {running ? (
              <><Loader2 size={18} className="animate-spin" /> Procesando con IA...</>
            ) : (
              <><Camera size={18} /> Probarme la prenda</>
            )}
          </button>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">3</span>
            Resultado
          </h2>

          <div className="flex-1 flex items-center justify-center">
            {running ? (
              <div className="text-center">
                <Loader2 size={48} className="mx-auto text-violet-400 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">La IA está procesando...</p>
                <p className="text-gray-400 text-xs mt-1">Puede tardar 1-2 minutos</p>
              </div>
            ) : result ? (
              <div className="w-full">
                <img
                  src={resolveImageUrl(result)}
                  alt="Resultado del probador virtual"
                  className="w-full rounded-xl object-contain max-h-96"
                />
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-sm text-violet-600 hover:underline"
                >
                  Ver imagen completa →
                </a>
              </div>
            ) : (
              <div className="text-center text-gray-300">
                <ImageIcon size={48} className="mx-auto mb-3" />
                <p className="text-sm">El resultado aparecerá aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
