import { useRef, useState, useCallback } from 'react';
import { Upload, ImagePlus, Loader2 } from 'lucide-react';

interface Props {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export function UploadZone({ onUpload, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      await onUpload(file);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !loading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-violet-400 bg-violet-50 scale-[1.01]'
          : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
      } ${loading ? 'pointer-events-none opacity-70' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <Loader2 size={36} className="text-violet-500 animate-spin" />
        ) : dragging ? (
          <Upload size={36} className="text-violet-500" />
        ) : (
          <ImagePlus size={36} className="text-gray-400" />
        )}

        <div>
          <p className="font-semibold text-gray-700">
            {loading ? 'Analizando con IA...' : 'Subir prenda'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'GPT-4o está extrayendo las etiquetas' : 'Arrastra una imagen o haz clic para seleccionar'}
          </p>
        </div>
      </div>
    </div>
  );
}
