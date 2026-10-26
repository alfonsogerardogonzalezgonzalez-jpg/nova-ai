import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Leaf,
  Globe,
  Zap,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { AppMode, AppScreen, PlanId } from '../types';
import { MascotRobot } from '../components/MascotRobot';
import { INITIAL_SUGGESTIONS_NINO, INITIAL_SUGGESTIONS_ADULTO, PLANS } from '../utils/constants';

interface HomeScreenProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ecoMode: boolean;
  setEcoMode: (eco: boolean) => void;
  setScreen: (screen: AppScreen) => void;
  onSelectPrompt: (prompt: string) => void;
  onOpenWikiModal: (query?: string) => void;
  activePlan: PlanId;
  questionsUsed: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  mode,
  setMode,
  ecoMode,
  setEcoMode,
  setScreen,
  onSelectPrompt,
  onOpenWikiModal,
  activePlan,
  questionsUsed,
}) => {
  const [wikiSearchInput, setWikiSearchInput] = useState('');
  const plan = PLANS[activePlan];
  const remaining = Math.max(0, plan.dailyLimit - questionsUsed);

  const suggestions = mode === 'nino' ? INITIAL_SUGGESTIONS_NINO : INITIAL_SUGGESTIONS_ADULTO;

  const handleWikiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wikiSearchInput.trim()) {
      onOpenWikiModal(wikiSearchInput.trim());
    }
  };

  return (
    <div className="min-h-full pb-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Hero Section with Cute Mascot */}
      <div className="pt-6 sm:pt-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-transparent p-6 sm:p-10 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden">
        {/* Soft radial background aura */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Text Greeting */}
        <div className="flex-1 space-y-4 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-400/30 text-sky-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Inteligencia Artificial Real y Verificable</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Descubre, aprende y comprueba con{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              NOVA AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
            Una IA pensada para toda la familia: explicaciones sencillas y divertidas para niños,
            y análisis riguroso para adultos. Conectada a la API oficial de Wikipedia y verificación de hechos real.
          </p>

          {/* Quick CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => setScreen('chat')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Abrir Conversación</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenWikiModal()}
              className="px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Explorar Wikipedia</span>
            </button>
          </div>

          {/* Live Status Pill */}
          <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini 3.8 Flash activo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Wikipedia REST API oficial</span>
            </div>
          </div>
        </div>

        {/* Mascot Robot Interactive Display */}
        <div className="shrink-0 z-10 flex flex-col items-center">
          <MascotRobot
            size="lg"
            mode={mode}
            ecoMode={ecoMode}
            state={ecoMode ? 'eco' : mode === 'nino' ? 'happy' : 'investigating'}
            speechText={
              ecoMode
                ? '¡Modo Eco activo! Menos carga de cálculo y respuestas directas 🌱'
                : mode === 'nino'
                ? '¡Hola amiguito! Hazme cualquier pregunta, ¡me encanta explicar!'
                : 'Listo para responder con rigor y contrastar fuentes verificadas.'
            }
          />
        </div>
      </div>

      {/* Mode Selection Cards: Niño vs Adulto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Elige tu experiencia de aprendizaje</span>
          </h2>
          <span className="text-xs text-slate-400">Puedes cambiarlo en cualquier momento</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Niño */}
          <div
            onClick={() => setMode('nino')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              mode === 'nino'
                ? 'bg-blue-950/40 border-blue-500/70 shadow-lg shadow-blue-600/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-sky-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Modo Niño
                    {mode === 'nino' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                        Activo
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-sky-300 font-medium mt-0.5">
                    Didáctico, cálido y con ejemplos cotidianos
                  </p>
                </div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 transition-opacity ${
                  mode === 'nino' ? 'text-sky-400 opacity-100' : 'text-slate-600 opacity-30'
                }`}
              />
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Explicaciones claras sin tecnicismos confusos, analogías con cosas que a los niños les
              gustan (juegos, naturaleza, animales) y preguntas motivadoras para despertar su curiosidad.
            </p>
          </div>

          {/* Card Adulto */}
          <div
            onClick={() => setMode('adulto')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
              mode === 'adulto'
                ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-purple-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Modo Adulto
                    {mode === 'adulto' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white">
                        Activo
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">
                    Preciso, estructurado y analítico
                  </p>
                </div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 transition-opacity ${
                  mode === 'adulto' ? 'text-indigo-400 opacity-100' : 'text-slate-600 opacity-30'
                }`}
              />
            </div>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Respuestas en profundidad, datos contrastados, terminología científica y técnica,
              contexto histórico y enfoque profesional para estudio o trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Preguntas sugeridas ({mode === 'nino' ? 'para niños y curiosos' : 'para adultos e investigación'})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(promptText)}
              className="p-3.5 text-left rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-blue-500/40 transition-all text-xs text-slate-200 group flex items-start justify-between gap-3 cursor-pointer"
            >
              <span className="leading-snug group-hover:text-white transition-colors">
                {promptText}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Wikipedia Real Search Bar Box */}
      <div className="p-6 rounded-3xl bg-[#090D1A] border border-blue-900/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              Consulta directa a Wikipedia
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accede a artículos reales sin intermediarios ni información inventada.
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold self-start sm:self-auto">
            API REST Oficial
          </span>
        </div>

        <form onSubmit={handleWikiSubmit} className="flex gap-2">
          <input
            type="text"
            value={wikiSearchInput}
            onChange={(e) => setWikiSearchInput(e.target.value)}
            placeholder="Buscar artículo en Wikipedia (ej: Fotosíntesis, Albert Einstein, Marte)..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <span>Buscar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Eco Mode & Real Transparency Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-blue-950/30 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Modo Eco Inteligente</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ecoMode ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {ecoMode ? 'ACTIVADO' : 'DESACTIVADO'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Al activar el Modo Eco, NOVA utiliza <strong>gemini-3.1-flash-lite</strong> y sintetiza respuestas concisas para optimizar la carga de cálculo y latencia. Transparencia total: no elimina el consumo energético, pero ayuda a ser más eficiente.
            </p>
          </div>
        </div>

        <button
          onClick={() => setEcoMode(!ecoMode)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            ecoMode
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
        >
          {ecoMode ? 'Desactivar Modo Eco' : 'Activar Modo Eco'}
        </button>
      </div>

      {/* Plan & Quota Summary Box */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              Tu plan activo: <span className="text-sky-300">{plan.name}</span>
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Has utilizado <strong>{questionsUsed}</strong> de <strong>{plan.dailyLimit}</strong> preguntas hoy. ({remaining} disponibles)
            </p>
          </div>
        </div>

        <button
          onClick={() => setScreen('planes')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold border border-slate-700 transition-colors cursor-pointer shrink-0"
        >
          Ver y probar otros planes
        </button>
      </div>
    </div>
  );
};
