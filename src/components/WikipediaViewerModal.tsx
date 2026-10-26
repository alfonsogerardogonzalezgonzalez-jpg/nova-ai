import React, { useState } from 'react';
import { BookOpen, ExternalLink, Search, X, Loader2 } from 'lucide-react';
import { RealSource } from '../types';

interface WikipediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const WikipediaViewerModal: React.FC<WikipediaViewerModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<RealSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching Wikipedia:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0A0E1A] border border-blue-500/30 shadow-2xl shadow-blue-950/80 p-5 sm:p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-serif font-black text-white text-base">
              W
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Explorador de Wikipedia
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  API Oficial
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Consulta artículos enciclopédicos reales en español
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe un tema o concepto (ej: Fotosíntesis, Agujero negro)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </form>

        {/* Results Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span>Consultando Wikipedia en tiempo real...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm hover:text-sky-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-slate-300 leading-relaxed text-xs">
                      {item.snippet}
                    </p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-sky-400 border border-blue-500/30 shrink-0 transition-colors flex items-center gap-1 text-[11px] font-medium"
                    title="Ver artículo completo en Wikipedia"
                  >
                    <span>Abrir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Fuente: es.wikipedia.org</span>
                  <span className="truncate max-w-[280px]">{item.url}</span>
                </div>
              </div>
            ))
          ) : searched ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No se encontraron artículos directos en Wikipedia para "{query}". Prueba con otra palabra clave.
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 space-y-1">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-300">Exploración directa de Wikipedia</p>
              <p className="text-[11px] text-slate-500">
                NOVA AI extrae resúmenes y citas oficiales para verificar respuestas sin intermediarios inventados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
