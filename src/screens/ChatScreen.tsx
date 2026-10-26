import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Globe,
  ExternalLink,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Leaf,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { AppMode, ChatMessage, PlanId, RealSource, VerifyResult } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { MascotRobot } from '../components/MascotRobot';
import { FactCheckModal } from '../components/FactCheckModal';
import { PLANS, INITIAL_SUGGESTIONS_NINO, INITIAL_SUGGESTIONS_ADULTO } from '../utils/constants';

interface ChatScreenProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ecoMode: boolean;
  setEcoMode: (eco: boolean) => void;
  groundingEnabled: boolean;
  setGroundingEnabled: (enabled: boolean) => void;
  activePlan: PlanId;
  questionsUsed: number;
  onNewChat: () => void;
  onOpenPlans: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  onSendMessage,
  isLoading,
  mode,
  setMode,
  ecoMode,
  setEcoMode,
  groundingEnabled,
  setGroundingEnabled,
  activePlan,
  questionsUsed,
  onNewChat,
  onOpenPlans,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Fact check verification modal state
  const [factCheckOpen, setFactCheckOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [activeVerifyResult, setActiveVerifyResult] = useState<VerifyResult | null>(null);
  const [activeVerifyQuestion, setActiveVerifyQuestion] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plan = PLANS[activePlan];
  const limitReached = questionsUsed >= plan.dailyLimit;
  const remainingQuestions = Math.max(0, plan.dailyLimit - questionsUsed);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Form Submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading || limitReached) return;

    const content = inputValue.trim();
    setInputValue('');
    await onSendMessage(content);
  };

  // Handle keyboard shortcut Enter / Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Copy message
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-To-Speech using Web Speech API in Spanish
  const handleToggleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*_#`[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = mode === 'nino' ? 0.95 : 1.05;
    utterance.pitch = mode === 'nino' ? 1.15 : 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Run Fact-Checking ("Comprueba tu respuesta")
  const handleRunVerify = async (message: ChatMessage, prevQuestion?: string) => {
    setFactCheckOpen(true);
    setActiveVerifyQuestion(prevQuestion || 'Consulta realizada');

    // If message already has cached verification, show it directly
    if (message.verification) {
      setActiveVerifyResult(message.verification);
      return;
    }

    setVerifyLoading(true);
    setActiveVerifyResult(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: prevQuestion || '',
          answer: message.content,
          mode,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al contrastar respuesta');
      }

      const data: VerifyResult = await res.json();
      setActiveVerifyResult(data);
      // Cache in message object
      message.verification = data;
    } catch (err: any) {
      console.error('Error in verification:', err);
      setActiveVerifyResult({
        verdict: 'NO_VERIFICABLE',
        score: 50,
        summary: 'No se pudo completar la comprobación externa en este momento.',
        pointsChecked: ['Error en conexión con el servicio de verificación'],
        caveats: err?.message || 'Servicio de verificación no disponible temporalmente.',
        sources: [],
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const suggestions = mode === 'nino' ? INITIAL_SUGGESTIONS_NINO : INITIAL_SUGGESTIONS_ADULTO;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-3 sm:px-6 animate-fadeIn pb-16 md:pb-2">
      {/* Sub-Header: Chat Mode Controls */}
      <div className="py-2.5 px-3 mb-2 rounded-2xl bg-[#090D1A]/90 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Persona / Mode info */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            {mode === 'nino' ? '👦 Modo Niño' : '🧑‍💼 Modo Adulto'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">
            {ecoMode ? 'Modelo gemini-3.1-flash-lite' : 'Modelo gemini-3.8-flash'}
          </span>
        </div>

        {/* Right: Quick toggles */}
        <div className="flex items-center gap-2">
          {/* Google Search Grounding toggle */}
          <button
            onClick={() => setGroundingEnabled(!groundingEnabled)}
            disabled={ecoMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              groundingEnabled && !ecoMode
                ? 'bg-blue-950/80 text-sky-300 border-blue-500/40'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            } ${ecoMode ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={
              ecoMode
                ? 'Búsqueda web desactivada en Modo Eco para optimizar recursos'
                : 'Búsqueda web en Google Search Grounding activa para datos recientes'
            }
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Google Grounding</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px] font-medium transition-colors cursor-pointer"
            title="Iniciar nueva conversación limpia"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Nueva charla</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.length === 0 ? (
          /* Empty Chat Welcome State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
            <MascotRobot
              size="md"
              mode={mode}
              ecoMode={ecoMode}
              state="happy"
              speechText={
                mode === 'nino'
                  ? '¡Hola! Pregúntame sobre animales, estrellas, inventos o tu tarea escolar. ¡Te responderé con ejemplos divertidos!'
                  : 'Hola. Pregúntame sobre cualquier disciplina científica, histórica, técnica o actual. Citaré fuentes reales.'
              }
            />

            <div className="max-w-md space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                ¿Qué deseas investigar con NOVA?
              </h2>
              <p className="text-xs text-slate-400">
                Todas las respuestas son generadas por Gemini con datos reales de Wikipedia y fuentes comprobables.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="w-full max-w-lg space-y-2 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Preguntas de ejemplo:
              </span>
              <div className="flex flex-col gap-2">
                {suggestions.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="p-3 text-left rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span className="group-hover:text-white transition-colors">{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render Messages */
          messages.map((message, index) => {
            const isUser = message.role === 'user';
            const prevQuestion = !isUser && index > 0 ? messages[index - 1].content : undefined;

            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Mini Avatar */}
                {!isUser && (
                  <div className="shrink-0 mt-1">
                    <MascotRobot size="sm" mode={message.mode} ecoMode={message.ecoMode} state="happy" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[90%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-blue-600/20'
                      : 'bg-[#0B0F1E] border border-blue-950/80 text-slate-100 rounded-tl-none shadow-black/40'
                  }`}
                >
                  {/* Assistant Tag & Model Info */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sky-400">NOVA</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                          {message.mode === 'nino' ? '👦 Modo Niño' : '🧑‍💼 Adulto'}
                        </span>
                        {message.ecoMode && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                            <Leaf className="w-2.5 h-2.5" /> Eco
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : message.content ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <div className="flex items-center gap-2 py-1.5 text-xs text-sky-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>NOVA escribiendo...</span>
                    </div>
                  )}

                  {/* Real Sources Display (Wikipedia and Grounding) */}
                  {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                          Fuentes reales consultadas ({message.sources.length}):
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">Auténticas</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-[11px] text-slate-300 hover:text-white transition-all group"
                            title={src.snippet || src.url}
                          >
                            {src.type === 'wikipedia' ? (
                              <span className="font-serif font-black text-sky-400 text-xs">W</span>
                            ) : (
                              <Globe className="w-3 h-3 text-sky-400" />
                            )}
                            <span className="max-w-[180px] sm:max-w-[220px] truncate">{src.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-300" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounding Note (e.g. if quota was exceeded for search) */}
                  {!isUser && message.groundingNote && (
                    <div className="mt-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-sky-200/90 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>{message.groundingNote}</span>
                    </div>
                  )}

                  {/* Action Bar for Assistant Message: Fact Check, Copy, Listen OR Retry if Error */}
                  {!isUser && (
                    <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {message.isError && message.retryPrompt ? (
                        <button
                          onClick={() => onSendMessage(message.retryPrompt!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-blue-600/30"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reintentar pregunta</span>
                        </button>
                      ) : (
                        /* "Comprueba tu respuesta" button */
                        <button
                          onClick={() => handleRunVerify(message, prevQuestion)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 text-sky-300 border border-blue-500/30 font-semibold text-[11px] transition-all cursor-pointer shadow-sm shadow-blue-500/10 group"
                          title="Contrastar esta respuesta con la API de Wikipedia y fuentes comprobables"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                          <span>Comprueba tu respuesta</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1">
                        {/* Text to Speech */}
                        {!message.isError && (
                          <button
                            onClick={() => handleToggleSpeak(message.content, message.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              speakingId === message.id
                                ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                            title={speakingId === message.id ? 'Detener lectura' : 'Escuchar respuesta en voz alta'}
                          >
                            {speakingId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="p-1.5 rounded-lg bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                          title="Copiar texto"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator (Only shown before assistant message stream starts) */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="shrink-0 mt-1">
              <MascotRobot size="sm" mode={mode} ecoMode={ecoMode} state="thinking" />
            </div>
            <div className="p-4 rounded-3xl bg-[#0B0F1E] border border-blue-950/80 rounded-tl-none flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span className="text-xs text-slate-300">
                {ecoMode
                  ? 'NOVA (Modo Eco) procesando respuesta concisa...'
                  : 'NOVA investigando con Gemini y fuentes reales...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quota Limit Banner if Exceeded */}
      {limitReached && (
        <div className="mt-2 p-3 rounded-2xl bg-amber-950/70 border border-amber-500/50 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Has alcanzado tu límite diario de <strong>{plan.dailyLimit} preguntas</strong> para el plan{' '}
              <strong>{plan.name}</strong>.
            </span>
          </div>
          <button
            onClick={onOpenPlans}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
          >
            Subir de plan (Demo)
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="mt-2 pt-2">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0B0F1C] border border-blue-500/30 focus-within:border-blue-400 shadow-xl shadow-blue-950/40 transition-all"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || limitReached}
            placeholder={
              limitReached
                ? 'Límite de preguntas alcanzado por hoy.'
                : mode === 'nino'
                ? 'Haz una pregunta a NOVA (ej: ¿Por qué llueve? ¿Cómo vuelan los aviones?)...'
                : 'Escribe tu consulta o tema de investigación...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 resize-none outline-none max-h-32 min-h-[40px]"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || limitReached}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info line */}
        <div className="mt-1.5 px-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            {remainingQuestions} de {plan.dailyLimit} preguntas restantes hoy
          </span>
          <span className="hidden sm:inline">
            Presiona <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter</kbd> para enviar
          </span>
        </div>
      </div>

      {/* Fact Check Modal */}
      <FactCheckModal
        isOpen={factCheckOpen}
        onClose={() => setFactCheckOpen(false)}
        result={activeVerifyResult}
        isLoading={verifyLoading}
        questionText={activeVerifyQuestion}
      />
    </div>
  );
};
