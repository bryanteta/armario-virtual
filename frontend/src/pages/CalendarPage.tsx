import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, X, Sparkles, CalendarDays, Info } from 'lucide-react';
import { fetchMonth, assignOutfit, removeEntry, type CalendarEntry } from '../api/calendar';
import { fetchOutfits } from '../api/outfits';
import { resolveImageUrl } from '../api/client';
import type { Outfit } from '../types';

// Monday-first week (European/Spanish convention)
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// Convert JS getDay() (0=Sun) to Monday-first index (0=Mon, 6=Sun)
function mondayFirst(jsDay: number): number {
  return (jsDay + 6) % 7;
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
    setSelectedDay(null); // clear selection on month change
    try {
      const res = await fetchMonth(monthKey(year, month));
      const map: Record<string, CalendarEntry> = {};
      (res.data ?? []).forEach((e) => {
        // Only include entries where outfitId was successfully populated
        if (e.outfitId && e.outfitId.prendas) {
          map[e.date] = e;
        }
      });
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

  const handleDayClick = (ymd: string) => {
    setSelectedDay(prev => prev === ymd ? null : ymd);
  };

  const handleAssign = async (outfit: Outfit) => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      const res = await assignOutfit(selectedDay, outfit._id);
      if (res.data) {
        setEntries(prev => ({ ...prev, [selectedDay]: res.data! }));
        toast.success(`Outfit asignado al ${selectedDay}`);
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
      if (selectedDay === date) setSelectedDay(null);
      toast.success('Outfit eliminado del día');
    } catch {
      toast.error('Error eliminando');
    }
  };

  const firstDay = mondayFirst(new Date(year, month, 1).getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toYMD(now.getFullYear(), now.getMonth(), now.getDate());

  const filteredOutfits = outfits.filter(o =>
    o.ocasion.toLowerCase().includes(search.toLowerCase()) ||
    o.prendas.some(p => p.subcategoria.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedEntry = selectedDay ? entries[selectedDay] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendario de Outfits</h1>
        <p className="text-gray-500 mt-1">Planifica qué ponerte cada día</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Month navigation */}
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

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ymd = toYMD(year, month, day);
                const entry = entries[ymd];
                const isToday = ymd === todayStr;
                const isSelected = ymd === selectedDay;
                const isPast = ymd < todayStr;
                const prendas = entry?.outfitId?.prendas ?? [];

                return (
                  <div
                    key={ymd}
                    onClick={() => handleDayClick(ymd)}
                    className={`relative aspect-square rounded-xl cursor-pointer transition-all overflow-hidden border-2 ${
                      isSelected
                        ? 'border-violet-500 shadow-md shadow-violet-100'
                        : isToday
                        ? 'border-violet-300'
                        : 'border-transparent hover:border-gray-200'
                    } ${isPast && !entry ? 'opacity-40' : ''}`}
                  >
                    {entry && prendas.length > 0 ? (
                      <>
                        <div className={`absolute inset-0 grid ${prendas.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {prendas.slice(0, 4).map((p, idx) => (
                            <img
                              key={idx}
                              src={resolveImageUrl(p.imageUrl)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-black/25" />
                        <span className="absolute top-1 left-1.5 text-xs font-bold text-white drop-shadow">
                          {day}
                        </span>
                        <button
                          onClick={(e) => handleRemove(ymd, e)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-500 transition-colors"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center rounded-xl gap-0.5 ${
                        isToday ? 'bg-violet-100' : isSelected ? 'bg-violet-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <span className={`text-sm font-bold ${isToday ? 'text-violet-700' : 'text-gray-600'}`}>
                          {day}
                        </span>
                        {isSelected && !entry && (
                          <span className="text-xs text-violet-400">+</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected day info */}
          {selectedDay && (
            <div className="mt-3 p-3 bg-violet-50 rounded-xl">
              {selectedEntry ? (
                <div>
                  <p className="text-sm font-semibold text-violet-800 mb-1">
                    {selectedDay} — {selectedEntry.outfitId.ocasion}
                  </p>
                  <div className="flex gap-1.5">
                    {(selectedEntry.outfitId.prendas ?? []).slice(0, 5).map((p, i) => (
                      <img key={i} src={resolveImageUrl(p.imageUrl)} alt={p.subcategoria}
                        className="w-10 h-10 rounded-lg object-cover border border-violet-200" />
                    ))}
                  </div>
                  <p className="text-xs text-violet-600 mt-2">
                    Selecciona otro outfit en el panel para reemplazarlo →
                  </p>
                </div>
              ) : (
                <p className="text-sm text-violet-700 font-medium">
                  📅 {selectedDay} — selecciona un outfit del panel →
                </p>
              )}
            </div>
          )}
        </div>

        {/* Outfit selector panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col" style={{ maxHeight: 620 }}>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            Tus outfits
          </h3>

          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />

          {outfits.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300 gap-3">
              <CalendarDays size={36} />
              <div>
                <p className="text-sm font-medium text-gray-400">Sin outfits aún</p>
                <p className="text-xs text-gray-300 mt-1">Genera outfits en la pestaña Outfits</p>
              </div>
            </div>
          ) : (
            <>
              {!selectedDay && (
                <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-2">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  Haz clic en un día del calendario para asignarle un outfit
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {filteredOutfits.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
                ) : (
                  filteredOutfits.map(outfit => {
                    const isCurrentlyAssigned = selectedDay && entries[selectedDay]?.outfitId._id === outfit._id;
                    const usedOnDays = Object.entries(entries)
                      .filter(([, e]) => e.outfitId._id === outfit._id)
                      .map(([d]) => d.slice(8)); // day number only

                    return (
                      <button
                        key={outfit._id}
                        onClick={() => selectedDay
                          ? handleAssign(outfit)
                          : toast('Selecciona un día primero', { icon: '📅' })
                        }
                        disabled={saving}
                        className={`w-full text-left rounded-xl border-2 p-2.5 transition-all ${
                          isCurrentlyAssigned
                            ? 'border-violet-500 bg-violet-50'
                            : selectedDay
                            ? 'border-gray-200 hover:border-violet-400 hover:bg-violet-50 cursor-pointer'
                            : 'border-gray-100 cursor-default'
                        }`}
                      >
                        <div className="flex gap-1.5 mb-1.5">
                          {outfit.prendas.slice(0, 4).map((p, i) => (
                            <img
                              key={i}
                              src={resolveImageUrl(p.imageUrl)}
                              alt={p.subcategoria}
                              className="w-11 h-11 rounded-lg object-cover"
                            />
                          ))}
                          {outfit.prendas.length > 4 && (
                            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                              +{outfit.prendas.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-gray-700 capitalize truncate">{outfit.ocasion}</p>
                          {usedOnDays.length > 0 && (
                            <span className="text-xs text-violet-500 shrink-0">
                              día{usedOnDays.length > 1 ? 's' : ''} {usedOnDays.join(', ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {outfit.prendas.map(p => p.subcategoria).join(' · ')}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
