import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Shirt } from 'lucide-react';
import { ClothingCard } from '../components/ClothingCard';
import { UploadZone } from '../components/UploadZone';
import { FilterBar } from '../components/FilterBar';
import { uploadClothing, deleteClothing } from '../api/clothing';
import { removeBgAndSave } from '../api/removeBg';
import { get } from '../api/client';
import type { ClothingItem, Categoria, Estilo, Temporada, PaginatedResponse } from '../types';

export function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas');
  const [estilo, setEstilo] = useState<Estilo | ''>('');
  const [temporada, setTemporada] = useState<Temporada | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (categoria !== 'todas') params.set('categoria', categoria);
      if (estilo) params.set('estilo', estilo);
      if (temporada) params.set('temporada', temporada);
      const res = await get<PaginatedResponse<ClothingItem>>(`/clothing?${params}`);
      setItems(res.data ?? []);
    } catch {
      toast.error('Error cargando el armario');
    } finally {
      setLoading(false);
    }
  }, [categoria, estilo, temporada]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadClothing(file);
      if (res.data) {
        setItems((prev) => [res.data!, ...prev]);
        toast.success(`✓ ${res.data.subcategoria} añadida`);
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error subiendo la prenda');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClothing(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Prenda eliminada');
    } catch {
      toast.error('Error eliminando la prenda');
    }
  };

  const handleRemoveBg = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const toastId = toast.loading('Eliminando fondo...');
    try {
      const updated = await removeBgAndSave(item, (msg) => toast.loading(msg, { id: toastId }));
      setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      toast.success('¡Fondo eliminado!', { id: toastId });
    } catch (e: any) {
      toast.error(e.message ?? 'Error', { id: toastId });
    }
  };

  // Group by category for stats
  const stats = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.categoria] = (acc[i.categoria] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Armario</h1>
          {Object.keys(stats).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(stats).map(([cat, n]) => (
                <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {n} {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <UploadZone onUpload={handleUpload} loading={uploading} />
      </div>

      <FilterBar
        categoria={categoria}
        estilo={estilo}
        temporada={temporada}
        total={items.length}
        onCategoria={setCategoria}
        onEstilo={setEstilo}
        onTemporada={setTemporada}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Shirt size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg">
            {categoria !== 'todas' || estilo || temporada ? 'Sin prendas con estos filtros' : 'Tu armario está vacío'}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            {categoria !== 'todas' || estilo || temporada ? 'Prueba quitando algunos filtros' : 'Sube tu primera prenda arriba'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <ClothingCard key={item._id} item={item} onDelete={handleDelete} onRemoveBg={handleRemoveBg} />
          ))}
        </div>
      )}
    </div>
  );
}
