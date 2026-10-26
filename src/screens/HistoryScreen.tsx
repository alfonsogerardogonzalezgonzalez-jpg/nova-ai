import React, { useState } from 'react';
import {
  History,
  Search,
  MessageSquare,
  Trash2,
  Download,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ChatSession } from '../types';

interface HistoryScreenProps {
  sessions: ChatSession[];
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
  onNewChat: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onNewChat,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    const term = searchFilter.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(term);
    const contentMatch = s.messages.some((m) => m.content.toLowerCase().includes(term));
    return titleMatch || contentMatch;
  });

  const handleExport = (session: ChatSession, format: 'json' | 'txt') => {
    let fileContent = '';
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'json') {
      fileContent = JSON.stringify(session, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      const header = `=== HISTORIAL NOVA AI: ${session.title.toUpperCase()} ===\nFecha: ${new Date(
        session.createdAt
      ).toLocaleString()}\nModo: ${session.mode}\nTotal mensajes: ${session.messages.length}\n\n`;

      const body = session.messages
        .map(
          (m) =>
            `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'USUARIO' : 'NOVA AI'}:\n${
              m.content
            }\n`
        )
        .join('\n----------------------------------------\n\n');

      fileContent = header + body;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-ai-${session.id.slice(0, 8)}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full pb-16 px-4 sm:px-6 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-sky-400" />
            Historial de Conversaciones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revisa tus charlas anteriores, retoma preguntas o expórtalas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (confirmClear) {
                  onClearAll();
                  setConfirmClear(false);
                } else {
                  setConfirmClear(true);
                  setTimeout(() => setConfirmClear(false), 4000);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                confirmClear
                  ? 'bg-rose-950 text-rose-300 border-rose-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{confirmClear ? '¿Seguro? Haz clic para borrar' : 'Borrar todo'}</span>
            </button>
          )}

          <button
            onClick={onNewChat}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Nueva charla</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {sessions.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por título o contenido de mensajes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>
      )}

      {/* Session Cards */}
      {sessions.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-sky-400 mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No tienes conversaciones guardadas</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Cuando inicies una conversación en el Chat, se guardará aquí automáticamente para que puedas
              revisarla cuando quieras.
            </p>
          </div>
          <button
            onClick={onNewChat}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Empezar primera charla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No se encontraron conversaciones que coincidan con "{searchFilter}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div
                onClick={() => onSelectSession(session)}
                className="flex-1 cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-sky-300 transition-colors truncate">
                    {session.title || 'Conversación sin título'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                    {session.mode === 'nino' ? '👦 Niño' : '🧑‍💼 Adulto'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">
                  {session.messages[session.messages.length - 1]?.content || 'Sin mensajes'}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{session.messages.length} mensajes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExport(session, 'txt')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                  title="Exportar como texto plano (.txt)"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/40 transition-colors cursor-pointer"
                  title="Eliminar esta conversación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectSession(session)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/30"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
