import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { AppMode, AuthModalMode, PlanId, UserAccount } from '../types';
import { DEFAULT_DEMO_ACCOUNTS, loadUserAccounts } from '../utils/storage';

interface AuthModalProps {
  mode: AuthModalMode;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onSwitchMode: (mode: AuthModalMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onLoginSuccess,
  onSwitchMode,
}) => {
  if (!mode) return null;

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<AppMode>('nino');
  const [selectedAvatar, setSelectedAvatar] = useState('⚡');

  // Parental consent for minors
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentApproved, setParentApproved] = useState(false);

  const [formError, setFormError] = useState('');

  const existingAccounts = loadUserAccounts();

  const avatarsKid = ['⚡', '✦', '▲', '◆', '◈', '★'];
  const avatarsAdult = ['✦', '◈', '▲', '⚡', '★', '◉'];

  const currentAvatarList = accountType === 'nino' ? avatarsKid : avatarsAdult;

  const handleSelectQuickAccount = (acc: UserAccount) => {
    onLoginSuccess(acc);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Por favor, ingresa un nombre o apodo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Parental consent requirement for children
    if (accountType === 'nino' && !parentApproved) {
      setFormError('Para crear una cuenta infantil, se requiere la autorización expresa de un adulto responsable.');
      return;
    }

    const newUser: UserAccount = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: accountType,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString(),
      planId: 'gratis',
      parentalConsent:
        accountType === 'nino'
          ? {
              approved: true,
              parentName: parentName.trim() || 'Adulto Responsable',
              parentEmail: parentEmail.trim() || email.trim(),
              approvedAt: new Date().toISOString(),
            }
          : undefined,
      isDemoAccount: true,
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090D1A] border border-blue-500/30 shadow-2xl shadow-blue-950/80 p-5 sm:p-7 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {mode === 'login' ? 'Iniciar Sesión en NOVA AI' : 'Crear Cuenta de Usuario'}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-500/30">
                  Demo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Accede a tus conversaciones y límites personalizados'
                  : 'Registra un perfil infantil o adulto con seguridad'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Ethical Disclaimer Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sky-300 block">Demostración Visual de Autenticación:</span>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Por tu seguridad, <strong>NO se solicitan contraseñas</strong> ni se guardan en el navegador. La autenticación real con cifrado requiere configurar Firebase Authentication.
            </p>
          </div>
        </div>

        {formError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' ? (
          <div className="mt-5 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Selecciona una cuenta existente para ingresar:
              </span>
              <div className="space-y-2">
                {existingAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectQuickAccount(acc)}
                    className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                        {acc.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                            {acc.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {acc.role === 'nino' ? '👦 Niño' : '🧑‍💼 Adulto'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">{acc.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">¿No tienes cuenta aún?</span>
              <button
                onClick={() => onSwitchMode('register')}
                className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                Crear nueva cuenta
              </button>
            </div>
          </div>
        ) : (
          /* REGISTER MODE */
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
            {/* Account Type Picker: Niño vs Adulto */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Tipo de Cuenta:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('nino');
                    setSelectedAvatar('👦');
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    accountType === 'nino'
                      ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg block mb-0.5">👦</span>
                  <span className="font-bold text-xs block">Perfil Infantil</span>
                  <span className="text-[10px] text-slate-400">Menores de 14 años</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountType('adulto');
                    setSelectedAvatar('🧑‍💼');
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    accountType === 'adulto'
                      ? 'bg-violet-950/60 border-violet-500 text-white shadow-md shadow-violet-600/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🧑‍💼</span>
                  <span className="font-bold text-xs block">Perfil Adulto</span>
                  <span className="text-[10px] text-slate-400">Estudiantes y adultos</span>
                </button>
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Elige un Avatar:
              </label>
              <div className="flex gap-2">
                {currentAvatarList.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-blue-600/30 border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name / Alias */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nombre o Apodo:
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={accountType === 'nino' ? 'Ej: Leo, Sofi...' : 'Tu nombre o usuario...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-blue-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Correo Electrónico de Contacto:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-blue-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* PARENTAL CONSENT SECTION (FOR CHILD PROFILES) */}
            {accountType === 'nino' && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Autorización de un Adulto Requerida (Menores)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para proteger la privacidad de los niños según las normativas de seguridad digital, un padre, madre o tutor legal debe autorizar la creación de este perfil educativo.
                </p>

                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Nombre del Padre, Madre o Tutor..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="Correo electrónico del Tutor..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={parentApproved}
                    onChange={(e) => setParentApproved(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-[11px] text-slate-200 leading-snug">
                    Declaro que soy un adulto responsable y autorizo la creación de este perfil infantil en NOVA AI.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Cuenta (Modo Demostración)</span>
            </button>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">¿Ya tienes una cuenta?</span>
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
