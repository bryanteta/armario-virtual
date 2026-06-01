import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X, Sparkles, CalendarDays } from 'lucide-react';
import { fetchMonth, assignOutfit, removeEntry, type CalendarEntry } from '../api/calendar';
import { fetchOutfits } from '../api/outfits';
import { resolveImageUrl } from '../api/client';
import type { Outfit } from '../types';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [entries, setEntries] = useState<Record<string, CalendarEntry>>({});
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMonth(monthKey(year, month));
      const map: Record<string, CalendarEntry> = {};
      (res.data ?? []).forEach((e) => { map[e.date] = e; });
      setEntries(map);
    } catch {
      toast.error('Error cargando el calendario');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const loadOutfits = useCallback(async () => {
    try {
      const res = await fetchOutfits();
      setOutfits(res.data ?? []);
    } catch {}
  }, []);

  useEffect(() => { loadMonth(); }, [loadMonth]);
  useEffect(() => { loadOutfits(); }, [loadOutfits]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleAssign = async (outfit: Outfit) => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      const res = await assignOutfit(selectedDay, outfit._id);
      if (res.data) {
        setEntries(prev => ({ ...prev, [selectedDay]: res.data! }));
        toast.success('Outfit asignado');
        setSelectedDay(null);
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Error asignando outfit');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeEntry(date);
      setEntries(prev => { const n = { ...prev }; delete n[date]; return n; });
      toast.success('Outfit eliminado del día');
    } catch {
      toast.error('Error eliminando');
    }
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toYMD(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredOutfits = outfits.filter(o =>
    o.ocasion.toLowerCase().includes(search.toLowerCase()) ||
    o.prendas.some(p => p.subcategoria.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Outfits</h1>
        <p className="text-gray-500 mt-1">Planifica qué ponerte cada día</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-gray-800 text-lg">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ymd = toYMD(year, month, day);
                const entry = entries[ymd];
                const isToday = ymd === todayStr;
                const isSelected = ymd === selectedDay;
                const isPast = ymd < todayStr;

                return (
                  <div
                    key={ymd}
                    onClick={() => setSelectedDay(ymd === selectedDay ? null : ymd)}
                    className={`relative aspect-square rounded-xl cursor-pointer transition-all overflow-hidden border-2 ${
                      isSelected
                        ? 'border-violet-500 shadow-md shadow-violet-100'
                        : isToday
                        ? 'border-violet-200'
                        : 'border-transparent hover:border-gray-200'
                    } ${isPast && !entry ? 'opacity-40' : ''}`}
                  >
                    {entry ? (
                      <>
                        <div className="absolute inset-0 grid grid-cols-2">
                          {entry.outfitId.prendas.slice(0, 4).map((p, idx) => (
                            <img
                              key={idx}
                              src={resolveImageUrl(p.imageUrl)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-black/20" />
                        <span className={`absolute top-1 left-1.5 text-xs font-bold ${isToday ? 'text-violet-200' : 'text-white'}`}>
                          {day}
                        </span>
                        <button
                          onClick={(e) => handleRemove(ymd, e)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X size={8} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center rounded-xl ${isToday ? 'bg-violet-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <span className={`text-sm font-semibold ${isToday ? 'text-violet-700' : 'text-gray-600'}`}>
                          {day}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedDay && (
            <div className="mt-3 px-2 py-1.5 bg-violet-50 rounded-xl text-sm text-violet-700 font-medium">
              Asignando para el {selectedDay} — selecciona un outfit →
            </div>
          )}
        </div>

        {/* Outfit selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col max-h-[600px]">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            Tus outfits
          </h3>

          <input
            type="text"
            placeholder="Buscar outfit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />

          {outfits.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300 gap-3">
              <CalendarDays size={36} />
              <p className="text-sm">Genera outfits primero en la pestaña Outfits</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredOutfits.map(outfit => (
                <button
                  key={outfit._id}
                  onClick={() => selectedDay ? handleAssign(outfit) : toast('Primero selecciona un día en el calendario', { icon: '👆' })}
                  disabled={saving}
                  className={`w-full text-left rounded-xl border-2 p-2 transition-all ${
                    selectedDay
                      ? 'border-violet-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer'
                      : 'border-gray-100 cursor-default'
                  }`}
                >
                  <div className="flex gap-1.5 mb-1.5">
                    {outfit.prendas.slice(0, 4).map((p, i) => (
                      <img
                        key={i}
                        src={resolveImageUrl(p.imageUrl)}
                        alt={p.subcategoria}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 capitalize truncate">{outfit.ocasion}</p>
                  <p className="text-xs text-gray-400 truncate">{outfit.justificacion.slice(0, 60)}...</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
