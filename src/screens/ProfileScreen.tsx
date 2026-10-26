import React from 'react';
import {
  User,
  ShieldCheck,
  Zap,
  MessageSquare,
  LogOut,
  Calendar,
  Mail,
  Lock,
  Server,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AppMode, PlanId, UserAccount } from '../types';
import { PLANS } from '../utils/constants';

interface ProfileScreenProps {
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onSelectMode: (mode: AppMode) => void;
  onGoToPlans: () => void;
  onGoToChat: () => void;
  questionsUsed: number;
  sessionsCount: number;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSelectMode,
  onGoToPlans,
  onGoToChat,
  questionsUsed,
  sessionsCount,
}) => {
  const currentPlan = currentUser?.planId ? PLANS[currentUser.planId] : PLANS.gratis;
  const remaining = Math.max(0, currentPlan.dailyLimit - questionsUsed);

  return (
    <div className="min-h-full pb-16 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-sky-400" />
            Perfil de Usuario
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de cuenta, privacidad, límites y estado de autenticación.
          </p>
        </div>

        {currentUser ? (
          <button
            onClick={onLogout}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
            >
              Crear Cuenta
            </button>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      {currentUser ? (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F1E] to-[#0A0D18] border border-blue-500/30 shadow-2xl shadow-blue-950/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <div className="w-full h-full rounded-[14px] bg-[#0A0E1A] flex items-center justify-center text-3xl">
                  {currentUser.avatar}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">{currentUser.name}</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-500/30">
                    {currentUser.role === 'nino' ? '👦 Modo Niño' : '🧑‍💼 Modo Adulto'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{currentUser.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectMode(currentUser.role === 'nino' ? 'adulto' : 'nino')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cambiar a {currentUser.role === 'nino' ? 'Modo Adulto' : 'Modo Niño'}
              </button>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cambiar de Cuenta
              </button>
            </div>
          </div>

          {/* User Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Daily Quota */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Consultas hoy</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">{questionsUsed}</span>
                <span className="text-xs text-slate-500 font-medium">/ {currentPlan.dailyLimit}</span>
              </div>
              <span className="text-[10px] text-sky-400 font-medium block mt-1">
                {remaining} preguntas disponibles
              </span>
            </div>

            {/* Plan Tier */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Plan actual</span>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Activo</span>
                </div>
                <span className="text-lg font-bold text-white block mt-1">{currentPlan.name}</span>
                <span className="text-[11px] text-slate-400 block">{currentPlan.price} {currentPlan.period}</span>
              </div>
              <button
                onClick={onGoToPlans}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer text-left mt-2"
              >
                Ver opciones de plan →
              </button>
            </div>

            {/* Private History */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Charlas privadas</span>
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-2xl font-black text-white mt-1 block">{sessionsCount}</span>
                <span className="text-[10px] text-slate-400">Guardadas solo en este perfil</span>
              </div>
              <button
                onClick={onGoToChat}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer text-left mt-2"
              >
                Abrir chat →
              </button>
            </div>
          </div>

          {/* Parental Consent Banner for Minors */}
          {currentUser.role === 'nino' && currentUser.parentalConsent && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-300 text-sm">
                  Consentimiento Parental Verificado
                </h3>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                  Este perfil infantil cuenta con la autorización de{' '}
                  <strong>{currentUser.parentalConsent.parentName || 'Tutor legal'}</strong> (
                  {currentUser.parentalConsent.parentEmail}). Cuenta con filtro de contenidos educativos,
                  lenguaje seguro y límites supervisados.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Guest Mode Notice */
        <div className="p-7 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-sky-400 mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-white">Estás usando NOVA AI como Invitado</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              En modo invitado puedes conversar libremente, pero tus límites y conversaciones se reinician
              al cambiar de dispositivo. Crea o inicia sesión en un perfil para separar tus chats privados.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/30"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Crear Cuenta (Demo)
            </button>
          </div>
        </div>
      )}

      {/* Security & Cloud Authentication Architecture Explanation */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#080C16] border border-blue-900/40 space-y-4">
        <div className="flex items-center gap-2.5 text-sky-400">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-base text-white">
            Arquitectura de Seguridad y Requisitos para Cuentas Reales
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Para garantizar la máxima protección de tus datos personales y cumplir con los más altos estándares
          de ciberseguridad, esta aplicación se apega a principios estrictos:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Why no password in local storage */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Cero contraseñas en localStorage</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Almacenar contraseñas o hashes falsos en el navegador del cliente es una vulnerabilidad grave.
              Por diseño ético, NOVA nunca guarda contraseñas en el almacenamiento local.
            </p>
          </div>

          {/* Child safety / Parental consent */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Autorización de un Adulto (Menores)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Bajo normativas de protección a la infancia (como COPPA), antes de solicitar datos personales o
              vincular servicios en la nube para niños, es mandatoria la autorización expresa de un padre o tutor legal.
            </p>
          </div>
        </div>

        {/* Roadmap for real production Firebase */}
        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 space-y-2 text-xs">
          <span className="font-bold text-sky-300 flex items-center gap-1.5">
            <Server className="w-4 h-4" />
            ¿Qué se requiere para activar el sistema 100% en la nube con Firebase?
          </span>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
            <li>
              <strong>Aprovisionamiento en Google Cloud:</strong> Aceptar los términos de Firebase en la interfaz de AI Studio para crear la base de datos Firestore y el servicio de Auth.
            </li>
            <li>
              <strong>Firebase Authentication (Google Sign-In / OAuth):</strong> Permite iniciar sesión con cuentas de Google seguras mediante tokens JWT firmados criptográficamente.
            </li>
            <li>
              <strong>Reglas de Seguridad Firestore (`firestore.rules`):</strong> Garantizan a nivel de base de datos que cada usuario solo pueda leer y escribir sus propias conversaciones (`allow read, write: if request.auth.uid == userId`).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
