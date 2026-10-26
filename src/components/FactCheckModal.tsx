import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Globe,
  X,
  Info,
} from 'lucide-react';
import { RealSource, VerifyResult } from '../types';

interface FactCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerifyResult | null;
  isLoading: boolean;
  questionText?: string;
}

export const FactCheckModal: React.FC<FactCheckModalProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  questionText,
}) => {
  if (!isOpen) return null;

  const getVerdictBadge = (verdict: VerifyResult['verdict']) => {
    switch (verdict) {
      case 'VERIFICADO':
        return {
          label: 'Verificado con fuentes reales',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          bgColor: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          scoreColor: 'text-emerald-400',
        };
      case 'PARCIALMENTE_VERIFICADO':
        return {
          label: 'Parcialmente verificado',
          icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
          bgColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          scoreColor: 'text-amber-400',
        };
      case 'CON_DISCREPANCIAS':
        return {
          label: 'Se detectaron discrepancias',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          bgColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
          scoreColor: 'text-rose-400',
        };
      case 'NO_VERIFICABLE':
      default:
        return {
          label: 'Sin evidencia concluyente disponible',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          bgColor: 'bg-slate-800/60 border-slate-600/40 text-slate-300',
          scoreColor: 'text-slate-400',
        };
    }
  };

  const badgeInfo = result ? getVerdictBadge(result.verdict) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B0F1C] border border-blue-500/30 shadow-2xl shadow-blue-950/80 p-5 sm:p-7 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <div className="w-full h-full rounded-[14px] bg-[#0A0E1A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Comprueba tu respuesta
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-500/30">
                  Auditoría Real
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Contraste de datos mediante Wikipedia y Google Search Grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-violet-500/20 border-b-violet-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Consultando fuentes en tiempo real...</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Conectando con la API oficial de Wikipedia y contrastando afirmaciones con hechos comprobables.
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="mt-5 space-y-5">
            {/* Question being verified if available */}
            {questionText && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Tema a contrastar:
                </span>
                <p className="text-slate-200 italic font-medium">"{questionText}"</p>
              </div>
            )}

            {/* Verdict Card */}
            {badgeInfo && (
              <div className={`p-4 rounded-2xl border ${badgeInfo.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-black/30 backdrop-blur-sm mt-0.5">
                    {badgeInfo.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold tracking-wider uppercase opacity-80 block">
                      Resultado del Fact-Checking
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {badgeInfo.label}
                    </h3>
                    <p className="text-xs mt-1 text-slate-200 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>
                </div>

                {/* Score */}
                {typeof result.score === 'number' && (
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-white/10 min-w-[90px] text-center self-end sm:self-center">
                    <span className="text-[10px] text-slate-400 font-medium">Confianza</span>
                    <span className={`text-2xl font-black ${badgeInfo.scoreColor}`}>
                      {result.score}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Points Checked */}
            {result.pointsChecked && result.pointsChecked.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#080C16] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  Puntos examinados:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.pointsChecked.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Real Sources Consulted */}
            <div className="p-4 rounded-2xl bg-[#080C16] border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  Fuentes reales consultadas ({result.sources?.length || 0})
                </span>
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  100% Auténticas
                </span>
              </h4>

              {result.sources && result.sources.length > 0 ? (
                <div className="space-y-2">
                  {result.sources.map((src: RealSource, idx: number) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-blue-500/40 transition-all text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {src.type === 'wikipedia' ? (
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 mt-0.5 font-serif font-black text-white text-[11px]">
                            W
                          </div>
                        ) : (
                          <Globe className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white group-hover:text-sky-300 truncate transition-colors">
                            {src.title}
                          </p>
                          {src.snippet && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                              {src.snippet}
                            </p>
                          )}
                          <span className="text-[10px] text-blue-400/80 truncate block mt-1">
                            {src.url}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 shrink-0 transition-colors mt-0.5" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-xs text-slate-400 bg-slate-900/50 rounded-xl italic">
                  No se encontraron fuentes directas vinculadas a este fragmento específico. NOVA reconoce con total honestidad cuando una afirmación no cuenta con enlace verificable.
                </div>
              )}
            </div>

            {/* Caveats and Ethical Disclosure */}
            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-900/40 flex items-start gap-2.5 text-[11px] text-slate-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-300">Compromiso de Honestidad Epistémica de NOVA AI:</span>
                <p className="mt-0.5 text-slate-400 leading-relaxed">
                  {result.caveats ||
                    'NOVA nunca inventa URLs ni fuentes. Si un dato no pudo ser contrastado fehacientemente, se indica de manera explícita.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay información de verificación para mostrar.
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
