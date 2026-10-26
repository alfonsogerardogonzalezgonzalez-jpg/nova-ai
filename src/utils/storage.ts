import { AppMode, ChatSession, PlanId, UsageQuota, UserAccount } from '../types';
import { PLANS } from './constants';

const STORAGE_KEYS = {
  CURRENT_USER: 'nova_ai_current_user',
  ALL_USERS: 'nova_ai_all_users',
  MODE: 'nova_ai_mode',
  ECO_MODE: 'nova_ai_eco_mode',
  GROUNDING: 'nova_ai_grounding',
  PLAN: 'nova_ai_plan',
};

// Initial demo accounts ready for testing user profiles
export const DEFAULT_DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_leo_nino',
    name: 'Leo Martínez',
    email: 'leo.martinez@ejemplo.com',
    role: 'nino',
    avatar: '⚡',
    createdAt: '2026-09-15T14:30:00.000Z',
    planId: 'gratis',
    parentalConsent: {
      approved: true,
      parentName: 'Patricia Martínez (Madre)',
      parentEmail: 'patricia.m@ejemplo.com',
      approvedAt: '2026-09-15T14:28:00.000Z',
    },
    isDemoAccount: true,
  },
  {
    id: 'usr_maria_adulta',
    name: 'Dra. María González',
    email: 'maria.gonzalez@ejemplo.com',
    role: 'adulto',
    avatar: '✦',
    createdAt: '2026-08-01T09:15:00.000Z',
    planId: 'pro',
    isDemoAccount: true,
  },
];

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// User accounts management (Demo / Visual System)
export function loadUserAccounts(): UserAccount[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
    return DEFAULT_DEMO_ACCOUNTS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEMO_ACCOUNTS;
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

export function saveUserAccount(user: UserAccount): void {
  const users = loadUserAccounts();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.unshift(user);
  }
  localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
}

export function loadCurrentUser(): UserAccount | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    saveUserAccount(user);
  }
}

// Mode & Preferences
export function loadSavedMode(): AppMode {
  const currentUser = loadCurrentUser();
  if (currentUser) return currentUser.role;
  const saved = localStorage.getItem(STORAGE_KEYS.MODE);
  return saved === 'nino' || saved === 'adulto' ? saved : 'nino';
}

export function saveAppMode(mode: AppMode): void {
  localStorage.setItem(STORAGE_KEYS.MODE, mode);
  const currentUser = loadCurrentUser();
  if (currentUser) {
    currentUser.role = mode;
    saveCurrentUser(currentUser);
  }
}

export function loadSavedEcoMode(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ECO_MODE) === 'true';
}

export function saveEcoMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.ECO_MODE, String(enabled));
}

export function loadSavedGrounding(): boolean {
  const val = localStorage.getItem(STORAGE_KEYS.GROUNDING);
  return val === null ? true : val === 'true';
}

export function saveGrounding(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.GROUNDING, String(enabled));
}

export function loadSavedPlan(): PlanId {
  const currentUser = loadCurrentUser();
  if (currentUser && currentUser.planId) return currentUser.planId;
  const plan = localStorage.getItem(STORAGE_KEYS.PLAN) as PlanId;
  return plan && PLANS[plan] ? plan : 'gratis';
}

export function savePlan(plan: PlanId): void {
  localStorage.setItem(STORAGE_KEYS.PLAN, plan);
  const currentUser = loadCurrentUser();
  if (currentUser) {
    currentUser.planId = plan;
    saveCurrentUser(currentUser);
  }
}

// Isolated Quota per User
function getQuotaKey(userId?: string): string {
  const prefix = userId ? `nova_ai_quota_${userId}` : 'nova_ai_quota_guest';
  return `${prefix}_${getTodayKey()}`;
}

export function getTodayQuota(userId?: string, planId?: PlanId): UsageQuota {
  const today = getTodayKey();
  const currentPlan = planId || loadSavedPlan();
  const key = getQuotaKey(userId);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as UsageQuota;
      if (parsed.date === today) {
        return {
          date: today,
          count: typeof parsed.count === 'number' ? parsed.count : 0,
          planId: currentPlan,
        };
      }
    } catch {
      // Ignore parse error and reset
    }
  }

  const initial: UsageQuota = {
    date: today,
    count: 0,
    planId: currentPlan,
  };
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

export function incrementTodayQuota(userId?: string, planId?: PlanId): UsageQuota {
  const current = getTodayQuota(userId, planId);
  current.count += 1;
  const key = getQuotaKey(userId);
  localStorage.setItem(key, JSON.stringify(current));
  return current;
}

export function resetTodayQuota(userId?: string, planId?: PlanId): UsageQuota {
  const today = getTodayKey();
  const currentPlan = planId || loadSavedPlan();
  const fresh: UsageQuota = {
    date: today,
    count: 0,
    planId: currentPlan,
  };
  const key = getQuotaKey(userId);
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

export function getRemainingQuestions(userId?: string, planId?: PlanId): number {
  const activePlanId = planId || loadSavedPlan();
  const quota = getTodayQuota(userId, activePlanId);
  const limit = PLANS[activePlanId].dailyLimit;
  return Math.max(0, limit - quota.count);
}

// Isolated Sessions per User
function getSessionsKey(userId?: string): string {
  return userId ? `nova_ai_sessions_${userId}` : 'nova_ai_sessions_guest';
}

export function loadChatSessions(userId?: string): ChatSession[] {
  const key = getSessionsKey(userId);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChatSessions(sessions: ChatSession[], userId?: string): void {
  const key = getSessionsKey(userId);
  localStorage.setItem(key, JSON.stringify(sessions));
}

export function saveSingleChatSession(session: ChatSession, userId?: string): void {
  const sessions = loadChatSessions(userId);
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  saveChatSessions(sessions, userId);
}

export function deleteChatSession(sessionId: string, userId?: string): ChatSession[] {
  const sessions = loadChatSessions(userId).filter((s) => s.id !== sessionId);
  saveChatSessions(sessions, userId);
  return sessions;
}

export function clearAllChatSessions(userId?: string): void {
  const key = getSessionsKey(userId);
  localStorage.removeItem(key);
}
