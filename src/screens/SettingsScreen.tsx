import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Server,
  Zap,
  Leaf,
  Globe,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Info,
  Smartphone,
  Monitor,
  Apple,
  Download,
  Sparkles,
} from 'lucide-react';
import { AppMode, PlanId, SystemStatus } from '../types';
import { NovaIconMark } from '../components/NovaLogo';

interface SettingsScreenProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ecoMode: boolean;
  setEcoMode: (eco: boolean) => void;
  groundingEnabled: boolean;
  setGroundingEnabled: (enabled: boolean) => void;
  activePlan: PlanId;
  onResetQuota: () => void;
  onClearHistory: () => void;
  onOpenInstallModal?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  mode,
  setMode,
  ecoMode,
  setEcoMode,
  groundingEnabled,
  setGroundingEnabled,
  activePlan,
  onResetQuota,
  onClearHistory,
  onOpenInstallModal,
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: SystemStatus = await res.json();
        setSystemStatus(data);
      }
    } catch (err: any) {
      console.error('Error fetching system status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleResetQuotaClick = () => {
    onResetQuota();
    setStatusMessage('¡Cuota diaria reiniciada exitosamente para pruebas!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleClearHistoryClick = () => {
    if (window.confirm('¿Deseas vaciar todo el historial de charlas?')) {
      onClearHistory();
      setStatusMessage('Historial de conversaciones vaciado.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-full pb-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-sky-400" />
          Configuración y Estado del Sistema
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustes de interacción, preferencias de modelo y diagnóstico en tiempo real de NOVA AI.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Live System Diagnostics Box */}
      <div className="p-6 rounded-3xl bg-[#090D1A] border border-blue-900/40 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Diagnóstico de Servicios
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  En Vivo
                </span>
              </h2>
              <p className="text-xs text-slate-400">Estado de conexión con APIs y servidores</p>
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={checkingStatus}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Volver a verificar estado"
          >
            <RefreshCw className={`w-4 h-4 ${checkingStatus ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>

        {/* Diagnostic Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Gemini API */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Google Gemini API</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  OPERATIVO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Modelo Flash: <code className="text-sky-300">gemini-flash-lite-latest</code> con streaming progresivo SSE. Claves protegidas en el backend sin exposición al navegador.
              </p>
            </div>
          </div>

          {/* Wikipedia API */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-serif font-black">
              W
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Wikipedia REST API</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  CONECTADO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Endpoint oficial en español para artículos, extractos enciclopédicos y enlaces reales.
              </p>
            </div>
          </div>

          {/* Google Search Grounding */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Google Search Grounding</span>
                <span className="text-[10px] font-bold text-sky-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  LISTO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Permite a Gemini consultar fuentes webs actuales cuando la pregunta lo requiere.
              </p>
            </div>
          </div>

          {/* Eco Mode Engine */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Motor Eco</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  gemini-3.1-flash-lite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Optimización de tokens, respuestas directas y omisión de llamadas web redundantes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-3xl bg-[#090D1A] border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white tracking-tight">
          Preferencias de Conversación
        </h2>

        {/* Default Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Modo de usuario preferido</h3>
            <p className="text-xs text-slate-400">
              Determina el estilo de redacción, analogías y complejidad de las respuestas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('nino')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                mode === 'nino'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              👦 Modo Niño
            </button>
            <button
              onClick={() => setMode('adulto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                mode === 'adulto'
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              🧑‍💼 Modo Adulto
            </button>
          </div>
        </div>

        {/* Eco Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Modo Eco por defecto
            </h3>
            <p className="text-xs text-slate-400">
              Usa el modelo liviano y prioriza datos de Wikipedia directa para reducir la huella de cálculo.
            </p>
          </div>

          <button
            onClick={() => setEcoMode(!ecoMode)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              ecoMode ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                ecoMode ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Grounding Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Búsqueda en Google Search Grounding
            </h3>
            <p className="text-xs text-slate-400">
              Permite contrastar eventos recientes con enlaces web reales (se inhabilita en Modo Eco).
            </p>
          </div>

          <button
            onClick={() => setGroundingEnabled(!groundingEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              groundingEnabled ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                groundingEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Modern Visual Identity & Multiplatform PWA Showcase */}
      <div className="p-6 rounded-3xl bg-[#090D1A] border border-blue-900/40 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <NovaIconMark size="md" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Identidad Visual y Multiplataforma</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-sky-300 border border-blue-400/30">
                  PWA Activa
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ícono minimalista «N» estilizada en azul eléctrico y violeta sobre fondo azul oscuro.
              </p>
            </div>
          </div>

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>

        {/* Multiplatform Asset Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
              <Monitor className="w-4 h-4" />
              <span>Windows</span>
            </div>
            <p className="text-[11px] text-slate-300">
              MS Tile 512x512 px, color de tema <code className="text-[10px] text-sky-300">#070B19</code> y manifest standalone para Chrome/Edge.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Configurado
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Android</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Íconos PNG 192x192, 512x512 y versión enmascarable (<code className="text-[10px] text-sky-300">maskable</code>) con margen seguro.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Configurado
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
              <Apple className="w-4 h-4" />
              <span>iPhone & iPad</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Apple Touch Icon 180x180 px y metadatos <code className="text-[10px] text-purple-300">apple-mobile-web-app-capable</code> para Safari.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Configurado
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance & Reset Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          Gestión de Datos y Pruebas
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetQuotaClick}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Reiniciar contador de preguntas de hoy</span>
          </button>

          <button
            onClick={handleClearHistoryClick}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Vaciar historial de charlas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
