import React from 'react';
import {
  MessageSquare,
  Home,
  CreditCard,
  History,
  Settings,
  Leaf,
  Sparkles,
  Zap,
  User,
  GraduationCap,
  Briefcase,
  Download,
} from 'lucide-react';
import { AppMode, AppScreen, PlanId, UserAccount } from '../types';
import { NovaLogo } from './NovaLogo';
import { PLANS } from '../utils/constants';

interface NavbarProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ecoMode: boolean;
  setEcoMode: (eco: boolean) => void;
  questionsUsed: number;
  activePlan: PlanId;
  onOpenWikiModal: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setScreen,
  mode,
  setMode,
  ecoMode,
  setEcoMode,
  questionsUsed,
  activePlan,
  currentUser,
  onOpenAuthModal,
  onOpenInstallModal,
}) => {
  const planConfig = PLANS[activePlan];
  const dailyLimit = planConfig.dailyLimit;
  const remaining = Math.max(0, dailyLimit - questionsUsed);
  const percentUsed = Math.min(100, Math.round((questionsUsed / dailyLimit) * 100));

  const navItems: { id: AppScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'planes', label: 'Planes', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'historial', label: 'Historial', icon: <History className="w-4 h-4" /> },
    { id: 'configuracion', label: 'Ajustes', icon: <Settings className="w-4 h-4" /> },
    { id: 'perfil', label: 'Perfil', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Main Navigation (Desktop and Tablet) */}
      <header className="sticky top-0 z-40 w-full border-b border-blue-950/60 bg-[#070A14]/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setScreen('inicio')}
              className="cursor-pointer text-left focus:outline-none transition-transform hover:scale-[1.02]"
            >
              <NovaLogo size="sm" showSubtitle={false} />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Action Controls: Mode Switch, Eco Switch, Quota Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Eco Mode Switch */}
            <button
              onClick={() => setEcoMode(!ecoMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                ecoMode
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="Modo Eco: Utiliza un modelo más liviano (gemini-3.1-flash-lite) y respuestas directas para optimizar cómputo."
            >
              <Leaf className={`w-3.5 h-3.5 ${ecoMode ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Modo Eco</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  ecoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
            </button>

            {/* Mode Switcher: Niño vs Adulto */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <button
                onClick={() => setMode('nino')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'nino'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Niño: Explicaciones claras, ejemplos dinámicos y lenguaje motivador."
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Niño</span>
              </button>
              <button
                onClick={() => setMode('adulto')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'adulto'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Adulto: Respuestas detalladas, profesionales y analíticas."
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Adulto</span>
              </button>
            </div>

            {/* Daily Quota Counter & Plan Pill */}
            <button
              onClick={() => setScreen('planes')}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1 rounded-xl bg-slate-900/90 border border-blue-900/50 hover:border-blue-500/50 transition-all text-xs cursor-pointer group"
              title="Haz clic para ver planes y cuota diaria"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400 font-medium">
                  {planConfig.name.replace('NOVA ', '')}
                </span>
                <span className="text-[11px] font-bold text-slate-200 group-hover:text-sky-300">
                  {remaining} <span className="text-[9px] font-normal text-slate-500">restantes</span>
                </span>
              </div>
            </button>

            {/* PWA App Install Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-violet-950/40"
                title="Instalar NOVA AI en Windows, Android o iPhone"
              >
                <Download className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden xl:inline">Instalar</span>
              </button>
            )}

            {/* User Account / Profile Button */}
            {currentUser ? (
              <button
                onClick={() => setScreen('perfil')}
                className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border transition-all text-xs cursor-pointer ${
                  currentScreen === 'perfil'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-blue-500/50 text-slate-300'
                }`}
                title={`Perfil: ${currentUser.name}`}
              >
                <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center text-xs">
                  {currentUser.avatar}
                </div>
                <span className="hidden lg:inline text-[11px] font-bold max-w-[85px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                title="Iniciar sesión o registrar cuenta"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070A14]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-sky-400 bg-blue-950/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
