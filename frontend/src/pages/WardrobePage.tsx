import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Shirt } from 'lucide-react';
import { ClothingCard } from '../components/ClothingCard';
import { UploadZone } from '../components/UploadZone';
import { fetchClothing, uploadClothing, deleteClothing } from '../api/clothing';
import { removeBgAndSave } from '../api/removeBg';
import type { ClothingItem } from '../types';

export function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchClothing();
      setItems(res.data ?? []);
    } catch (e) {
      toast.error('Error cargando el armario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadClothing(file);
      if (res.data) {
        setItems((prev) => [res.data!, ...prev]);
        toast.success(`✓ ${res.data.subcategoria} añadida al armario`);
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
    const toastId = toast.loading('Iniciando eliminación de fondo...');
    try {
      const updated = await removeBgAndSave(item, (msg) => {
        toast.loading(msg, { id: toastId });
      });
      setItems((prev) => prev.map((i) => (i._id === id ? updated : i)));
      toast.success('¡Fondo eliminado!', { id: toastId });
    } catch (e: any) {
      toast.error(e.message ?? 'Error quitando el fondo', { id: toastId });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Armario</h1>
        <p className="text-gray-500 mt-1">
          {items.length} {items.length === 1 ? 'prenda' : 'prendas'} en tu armario
        </p>
      </div>

      <div className="mb-8">
        <UploadZone onUpload={handleUpload} loading={uploading} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Shirt size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg">Tu armario está vacío</p>
          <p className="text-gray-300 text-sm mt-1">Sube tu primera prenda arriba</p>
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
