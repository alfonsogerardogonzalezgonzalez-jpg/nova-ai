export type AppMode = 'nino' | 'adulto';

export type AppScreen = 'inicio' | 'chat' | 'planes' | 'historial' | 'configuracion' | 'perfil';

export type PlanId = 'gratis' | 'pro' | 'ultra';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: AppMode;
  avatar: string;
  createdAt: string;
  planId: PlanId;
  parentalConsent?: {
    approved: boolean;
    parentName?: string;
    parentEmail?: string;
    approvedAt?: string;
  };
  isDemoAccount: boolean;
}

export type AuthModalMode = 'login' | 'register' | null;

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  dailyLimit: number;
  description: string;
  badge?: string;
  features: string[];
  groundingAllowed: boolean;
  deepResearchAllowed: boolean;
  historySaved: boolean;
}

export interface RealSource {
  title: string;
  url: string;
  snippet?: string;
  type: 'wikipedia' | 'google_search' | 'verified_web';
}

export interface VerifyResult {
  verdict: 'VERIFICADO' | 'PARCIALMENTE_VERIFICADO' | 'NO_VERIFICABLE' | 'CON_DISCREPANCIAS';
  score: number;
  summary: string;
  pointsChecked: string[];
  caveats?: string;
  sources: RealSource[];
  verifiedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  mode: AppMode;
  ecoMode?: boolean;
  modelUsed?: string;
  sources?: RealSource[];
  groundingUsed?: boolean;
  groundingNote?: string;
  searchQueries?: string[];
  verification?: VerifyResult;
  isError?: boolean;
  retryPrompt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: AppMode;
  messages: ChatMessage[];
}

export interface UsageQuota {
  date: string; // YYYY-MM-DD
  count: number;
  planId: PlanId;
}

export interface SystemStatus {
  status: string;
  hasGeminiKey: boolean;
  activeModel: string;
  ecoModel: string;
  wikipediaStatus: string;
  googleSearchGrounding: string;
  limitsEnabled: boolean;
  message: string;
}
