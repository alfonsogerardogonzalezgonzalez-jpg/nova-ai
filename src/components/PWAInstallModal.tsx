import React from 'react';
import { X, Download, Smartphone, Monitor, Apple, Check, Share, PlusSquare } from 'lucide-react';
import { NovaIconMark } from './NovaLogo';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<void>;
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isInstalled: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  isAndroid,
  isWindows,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#070B18] border border-blue-500/30 p-6 sm:p-8 shadow-2xl shadow-blue-950/60 text-slate-100 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-4 mb-6">
          <NovaIconMark size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white">Instalar NOVA AI</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-sky-300 border border-blue-400/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Accede a NOVA AI como una aplicación nativa en Windows, Android o iPhone.
            </p>
          </div>
        </div>

        {/* Device Highlights */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className={`p-3 rounded-2xl border text-center transition-all ${
            isWindows
              ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
              : 'bg-slate-900/50 border-slate-800/80'
          }`}>
            <Monitor className={`w-5 h-5 mx-auto mb-1.5 ${isWindows ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold block text-slate-200">Windows</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Escritorio nativo</span>
          </div>

          <div className={`p-3 rounded-2xl border text-center transition-all ${
            isAndroid
              ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
              : 'bg-slate-900/50 border-slate-800/80'
          }`}>
            <Smartphone className={`w-5 h-5 mx-auto mb-1.5 ${isAndroid ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold block text-slate-200">Android</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Ícono adaptativo</span>
          </div>

          <div className={`p-3 rounded-2xl border text-center transition-all ${
            isIOS
              ? 'bg-violet-950/40 border-violet-500/60 shadow-md shadow-violet-500/10'
              : 'bg-slate-900/50 border-slate-800/80'
          }`}>
            <Apple className={`w-5 h-5 mx-auto mb-1.5 ${isIOS ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="text-[11px] font-bold block text-slate-200">iPhone / iPad</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Apple Touch</span>
          </div>
        </div>

        {/* Action Section based on status & platform */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-xs">
            <Check className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>¡NOVA AI ya está instalada en este dispositivo! Puedes abrirla desde tu pantalla o menú de aplicaciones.</span>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/30 space-y-2.5 text-xs">
            <p className="font-semibold text-violet-300">Cómo añadir a la pantalla de inicio en iOS Safari:</p>
            <ol className="space-y-2 text-slate-300 text-[11px] pl-1">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Toca el botón <strong className="text-white">Compartir</strong> en la barra inferior de Safari</span>
                <Share className="w-3.5 h-3.5 text-sky-400 inline" />
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Baja y selecciona <strong className="text-white">«Añadir a pantalla de inicio»</strong></span>
                <PlusSquare className="w-3.5 h-3.5 text-sky-400 inline" />
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Toca <strong className="text-white">Añadir</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onInstall}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicación en este Dispositivo</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Funciona con Google Chrome, Microsoft Edge y navegadores compatibles con PWA.
            </p>
          </div>
        )}

        {/* Specifications Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>Ícono: 192x192 & 512x512 PWA Standard</span>
          <span>Apple Touch: 180x180 px</span>
          <span>Modo: Standalone (Sin barra de navegador)</span>
        </div>
      </div>
    </div>
  );
};
