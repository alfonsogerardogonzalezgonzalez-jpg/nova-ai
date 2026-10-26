/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppMode, AppScreen, AuthModalMode, ChatMessage, ChatSession, PlanId, UserAccount } from './types';
import {
  loadSavedMode,
  saveAppMode,
  loadSavedEcoMode,
  saveEcoMode,
  loadSavedGrounding,
  saveGrounding,
  loadSavedPlan,
  savePlan,
  getTodayQuota,
  incrementTodayQuota,
  resetTodayQuota,
  loadChatSessions,
  saveSingleChatSession,
  deleteChatSession,
  clearAllChatSessions,
  loadCurrentUser,
  saveCurrentUser,
} from './utils/storage';
import { PLANS } from './utils/constants';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { PlansScreen } from './screens/PlansScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WikipediaViewerModal } from './components/WikipediaViewerModal';
import { AuthModal } from './components/AuthModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(loadCurrentUser);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, triggerInstall } = usePWAInstall();

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('inicio');
  const [mode, setModeState] = useState<AppMode>(loadSavedMode);
  const [ecoMode, setEcoModeState] = useState<boolean>(loadSavedEcoMode);
  const [groundingEnabled, setGroundingState] = useState<boolean>(loadSavedGrounding);
  const [activePlan, setActivePlanState] = useState<PlanId>(loadSavedPlan);
  const [todayQuestionsUsed, setTodayQuestionsUsed] = useState<number>(() => {
    const user = loadCurrentUser();
    return getTodayQuota(user?.id, user?.planId).count;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const user = loadCurrentUser();
    return loadChatSessions(user?.id);
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return 'session_' + Date.now();
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Wikipedia modal
  const [wikiModalOpen, setWikiModalOpen] = useState(false);
  const [wikiModalQuery, setWikiModalQuery] = useState('');

  // Sync mode changes
  const handleSetMode = (newMode: AppMode) => {
    setModeState(newMode);
    saveAppMode(newMode);
  };

  // Sync eco mode changes
  const handleSetEcoMode = (newEco: boolean) => {
    setEcoModeState(newEco);
    saveEcoMode(newEco);
  };

  // Sync grounding changes
  const handleSetGrounding = (newGrounding: boolean) => {
    setGroundingState(newGrounding);
    saveGrounding(newGrounding);
  };

  // Sync plan changes
  const handleSelectPlan = (plan: PlanId) => {
    setActivePlanState(plan);
    savePlan(plan);
  };

  // User login handler
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    setModeState(user.role);
    saveAppMode(user.role);
    if (user.planId) {
      setActivePlanState(user.planId);
      savePlan(user.planId);
    }
    const userSessions = loadChatSessions(user.id);
    setSessions(userSessions);
    setTodayQuestionsUsed(getTodayQuota(user.id, user.planId).count);
    setMessages([]);
    setCurrentSessionId('session_' + Date.now());
    setAuthModalMode(null);
  };

  // User logout handler
  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
    const guestSessions = loadChatSessions();
    setSessions(guestSessions);
    setTodayQuestionsUsed(getTodayQuota().count);
    setMessages([]);
    setCurrentSessionId('session_' + Date.now());
  };

  // Reset daily quota for testing
  const handleResetQuota = () => {
    const fresh = resetTodayQuota(currentUser?.id, activePlan);
    setTodayQuestionsUsed(fresh.count);
  };

  // Clear all history
  const handleClearHistory = () => {
    clearAllChatSessions(currentUser?.id);
    setSessions([]);
    setMessages([]);
    setCurrentSessionId('session_' + Date.now());
  };

  // Start a new chat session
  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId('session_' + Date.now());
    setCurrentScreen('chat');
  };

  // Select a session from history
  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setModeState(session.mode);
    setCurrentScreen('chat');
  };

  // Delete a session from history
  const handleDeleteSession = (sessionId: string) => {
    const updated = deleteChatSession(sessionId, currentUser?.id);
    setSessions(updated);
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId('session_' + Date.now());
    }
  };

  // Send message to Gemini via streaming SSE endpoint with accurate quota & context
  const handleSendMessage = async (userText: string) => {
    const plan = PLANS[activePlan];
    const currentQuota = getTodayQuota(currentUser?.id, activePlan);

    if (currentQuota.count >= plan.dailyLimit) {
      alert(`Has alcanzado el límite diario de ${plan.dailyLimit} preguntas para el plan ${plan.name}. Puedes cambiar de plan en la sección Planes o reiniciar la cuota de pruebas.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
      mode,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    const assistantMsgId = 'msg_' + (Date.now() + 1);

    // Initial assistant message placeholder for progressive streaming
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'model',
      content: '',
      timestamp: new Date().toISOString(),
      mode,
      ecoMode,
      sources: [],
    };

    // Timeout: 45s to allow streaming complex or detailed answers without premature abort
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 45000);

    let streamAccumulatedText = '';
    let finalSources: any[] = [];
    let finalModelUsed = 'gemini-flash-lite-latest';
    let finalGroundingNote: string | undefined = undefined;
    let isSuccess = false;

    try {
      // Step 1: Try SSE streaming
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          ecoMode,
          enableGrounding: groundingEnabled && !ecoMode && plan.groundingAllowed,
          consultWikipedia: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error en el servicio de IA (${response.status})`);
      }

      // Add placeholder to messages list
      setMessages([...nextMessages, initialAssistantMessage]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          let eventType = 'message';
          let dataStr = '';

          const eventMatch = line.match(/^event:\s*(\w+)/m);
          if (eventMatch) eventType = eventMatch[1];

          const dataMatch = line.match(/^data:\s*(.+)$/m);
          if (dataMatch) dataStr = dataMatch[1];

          if (!dataStr) continue;

          try {
            const parsed = JSON.parse(dataStr);

            if (eventType === 'sources' && parsed.sources) {
              finalSources = parsed.sources;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, sources: finalSources } : m
                )
              );
            } else if (eventType === 'chunk' && parsed.text) {
              streamAccumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: streamAccumulatedText, sources: finalSources }
                    : m
                )
              );
            } else if (eventType === 'done') {
              isSuccess = true;
              finalModelUsed = parsed.modelUsed || finalModelUsed;
              finalGroundingNote = parsed.groundingNote;
              if (parsed.sources && parsed.sources.length > 0) {
                finalSources = parsed.sources;
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: streamAccumulatedText,
                        sources: finalSources,
                        modelUsed: finalModelUsed,
                        groundingNote: finalGroundingNote,
                      }
                    : m
                )
              );
            } else if (eventType === 'error') {
              throw new Error(parsed.error || 'Error reportado por el servidor');
            }
          } catch (jsonErr: any) {
            // If already custom error, rethrow
            if (eventType === 'error') throw jsonErr;
          }
        }
      }

      clearTimeout(timeoutId);

      // ONLY increment quota on successful completion
      if (isSuccess && streamAccumulatedText.trim().length > 0) {
        const updatedQuota = incrementTodayQuota(currentUser?.id, activePlan);
        setTodayQuestionsUsed(updatedQuota.count);

        // Update session in history
        const finalAssistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: 'model',
          content: streamAccumulatedText,
          timestamp: new Date().toISOString(),
          mode,
          ecoMode,
          modelUsed: finalModelUsed,
          sources: finalSources,
          groundingNote: finalGroundingNote,
        };

        const finalMessages = [...nextMessages, finalAssistantMessage];
        const firstUserMessage = finalMessages.find((m) => m.role === 'user');
        const sessionTitle = firstUserMessage
          ? firstUserMessage.content.slice(0, 45) + (firstUserMessage.content.length > 45 ? '...' : '')
          : 'Conversación con NOVA';

        const currentSession: ChatSession = {
          id: currentSessionId,
          title: sessionTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mode,
          messages: finalMessages,
        };

        saveSingleChatSession(currentSession, currentUser?.id);
        setSessions(loadChatSessions(currentUser?.id));
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error in chat stream:', error);

      let errorText = error?.message;
      if (error?.name === 'AbortError') {
        errorText =
          'La respuesta tardó más tiempo de lo esperado (45s). Para cuidar tu tiempo y recursos, la solicitud fue detenida. Puedes reintentar.';
      } else if (!errorText) {
        errorText = 'Ocurrió un problema de conexión al comunicarse con NOVA AI. Por favor, reintenta.';
      }

      // DO NOT deduct quota on error!
      const errorMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'model',
        content: `⚠️ ${errorText}`,
        timestamp: new Date().toISOString(),
        mode,
        isError: true,
        retryPrompt: userText,
      };

      // Replace assistant message with clean error notification
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== assistantMsgId);
        return [...filtered, errorMessage];
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Launch prompt from home
  const handleSelectPromptFromHome = (promptText: string) => {
    setCurrentScreen('chat');
    handleSendMessage(promptText);
  };

  // Open Wikipedia explorer
  const handleOpenWiki = (query?: string) => {
    setWikiModalQuery(query || '');
    setWikiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070A14] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-sky-200">
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        mode={mode}
        setMode={handleSetMode}
        ecoMode={ecoMode}
        setEcoMode={handleSetEcoMode}
        questionsUsed={todayQuestionsUsed}
        activePlan={activePlan}
        onOpenWikiModal={() => handleOpenWiki()}
        currentUser={currentUser}
        onOpenAuthModal={(m) => setAuthModalMode(m)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-1 w-full">
        {currentScreen === 'inicio' && (
          <HomeScreen
            mode={mode}
            setMode={handleSetMode}
            ecoMode={ecoMode}
            setEcoMode={handleSetEcoMode}
            setScreen={setCurrentScreen}
            onSelectPrompt={handleSelectPromptFromHome}
            onOpenWikiModal={handleOpenWiki}
            activePlan={activePlan}
            questionsUsed={todayQuestionsUsed}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            mode={mode}
            setMode={handleSetMode}
            ecoMode={ecoMode}
            setEcoMode={handleSetEcoMode}
            groundingEnabled={groundingEnabled}
            setGroundingEnabled={handleSetGrounding}
            activePlan={activePlan}
            questionsUsed={todayQuestionsUsed}
            onNewChat={handleNewChat}
            onOpenPlans={() => setCurrentScreen('planes')}
          />
        )}

        {currentScreen === 'planes' && (
          <PlansScreen
            activePlan={activePlan}
            onSelectPlan={handleSelectPlan}
            questionsUsed={todayQuestionsUsed}
            onResetQuota={handleResetQuota}
            onGoToChat={() => setCurrentScreen('chat')}
          />
        )}

        {currentScreen === 'historial' && (
          <HistoryScreen
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onClearAll={handleClearHistory}
            onNewChat={handleNewChat}
          />
        )}

        {currentScreen === 'configuracion' && (
          <SettingsScreen
            mode={mode}
            setMode={handleSetMode}
            ecoMode={ecoMode}
            setEcoMode={handleSetEcoMode}
            groundingEnabled={groundingEnabled}
            setGroundingEnabled={handleSetGrounding}
            activePlan={activePlan}
            onResetQuota={handleResetQuota}
            onClearHistory={handleClearHistory}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
          />
        )}

        {currentScreen === 'perfil' && (
          <ProfileScreen
            currentUser={currentUser}
            onOpenAuthModal={(m) => setAuthModalMode(m)}
            onLogout={handleLogout}
            onSelectMode={handleSetMode}
            onGoToPlans={() => setCurrentScreen('planes')}
            onGoToChat={() => setCurrentScreen('chat')}
            questionsUsed={todayQuestionsUsed}
            sessionsCount={sessions.length}
          />
        )}
      </main>

      {/* Global Wikipedia Search Modal */}
      <WikipediaViewerModal
        isOpen={wikiModalOpen}
        onClose={() => setWikiModalOpen(false)}
        initialQuery={wikiModalQuery}
      />

      {/* User Authentication Modal (Login / Register Demo) */}
      <AuthModal
        mode={authModalMode}
        onClose={() => setAuthModalMode(null)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchMode={(m) => setAuthModalMode(m)}
      />

      {/* PWA Multiplatform Installation Modal (Windows, Android, iPhone) */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={async () => {
          await triggerInstall();
        }}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isWindows={isWindows}
        isInstalled={isInstalled}
      />
    </div>
  );
}
