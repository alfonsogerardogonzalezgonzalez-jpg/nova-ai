import React from 'react';
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Info,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PlanId } from '../types';
import { PLANS } from '../utils/constants';

interface PlansScreenProps {
  activePlan: PlanId;
  onSelectPlan: (plan: PlanId) => void;
  questionsUsed: number;
  onResetQuota: () => void;
  onGoToChat: () => void;
}

export const PlansScreen: React.FC<PlansScreenProps> = ({
  activePlan,
  onSelectPlan,
  questionsUsed,
  onResetQuota,
  onGoToChat,
}) => {
  const currentPlanConfig = PLANS[activePlan];
  const remaining = Math.max(0, currentPlanConfig.dailyLimit - questionsUsed);

  return (
    <div className="min-h-full pb-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="pt-6 sm:pt-8 text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-400/30 text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Simulador de Planes de Acceso (Modo Demostración)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Elige el plan ideal para tus consultas
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Los planes a continuación funcionan en <strong>Modo Demostración interactivo</strong>. Puedes cambiar
          libremente entre ellos para probar los límites diarios de preguntas (<strong>Gratis: 30</strong>, <strong>Pro: 150</strong>, <strong>Ultra: 400</strong>) y desbloquear funciones
          sin ingresar tarjetas de crédito ni realizar ningún pago.
        </p>
      </div>

      {/* Quota & Testing Controls Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Plan activo:{' '}
              <span className="text-sky-300">{currentPlanConfig.name}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Demo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Has consumido <strong>{questionsUsed}</strong> de{' '}
              <strong>{currentPlanConfig.dailyLimit}</strong> preguntas diarias hoy. ({remaining}{' '}
              restantes).
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reinicio automático diario a las 00:00 (o manual para pruebas).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onResetQuota}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Reiniciar contador de preguntas de hoy para seguir probando"
          >
            <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
            <span>Reiniciar cuota (Pruebas)</span>
          </button>

          <button
            onClick={onGoToChat}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/30"
          >
            <span>Ir al Chat</span>
          </button>
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PLANS) as PlanId[]).map((planKey) => {
          const item = PLANS[planKey];
          const isSelected = activePlan === planKey;

          return (
            <div
              key={planKey}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-950/70 via-slate-900 to-[#0B0F1C] border-blue-500 shadow-2xl shadow-blue-600/20 ring-1 ring-blue-500/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge if available or Active label */}
              <div className="flex items-center justify-between min-h-[26px] mb-3">
                {item.badge ? (
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md">
                    {item.badge}
                  </span>
                ) : (
                  <div />
                )}

                {isSelected && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    ACTIVO AHORA
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white tracking-tight">{item.name}</h3>
                <p className="text-xs text-slate-400 min-h-[36px]">{item.description}</p>

                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {item.price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{item.period}</span>
                </div>

                {/* Daily limit callout */}
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Límite diario:</span>
                  <span className="font-bold text-sky-300">{item.dailyLimit} preguntas/día</span>
                </div>
              </div>

              {/* Feature List */}
              <div className="my-6 pt-5 border-t border-slate-800/80 space-y-3 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Incluye:
                </span>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPlan(planKey)}
                className={`w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-slate-800 text-sky-300 border border-blue-500/50 cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Plan Seleccionado</span>
                  </>
                ) : (
                  <span>Probar este plan (Demo)</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transparency & Ethical Notice */}
      <div className="p-6 rounded-3xl bg-[#090D1A] border border-blue-900/40 space-y-4">
        <div className="flex items-center gap-2.5 text-sky-400">
          <Info className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm text-white">
            Transparencia sobre cobros, límites y reinicio diario
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Esta aplicación cumple estrictamente con el principio de{' '}
          <strong>no activar cobros reales</strong>, no suscribir a servicios de pago ni solicitar
          información bancaria. Los límites de preguntas se calculan de manera aislada y local en el navegador
          para cada usuario o perfil, funcionando como <strong>límites de demostración</strong> para evaluar la
          experiencia completa de los tres niveles sin riesgos ni sorpresas.
        </p>
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <span className="font-bold text-sky-300 block">Límites diarios (Demo):</span>
            <p className="text-slate-400 leading-snug">
              <strong>Gratis: 30 preguntas/día</strong>, <strong>Pro: 150 preguntas/día</strong> y <strong>Ultra: 400 preguntas/día</strong>.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <span className="font-bold text-emerald-400 block">Reinicio Diario Automático:</span>
            <p className="text-slate-400 leading-snug">
              El contador se reinicia a 0 cada día a las 00:00 (fecha del calendario). También puedes reiniciarlo en cualquier momento con el botón de pruebas.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <span className="font-bold text-amber-400 block">Sin Pasarelas de Pago:</span>
            <p className="text-slate-400 leading-snug">
              Los precios son ilustrativos; cambiar entre Gratis, Pro y Ultra es 100% libre e interactivo para pruebas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
