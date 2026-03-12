import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  AIContextValue,
  Annotation,
  ChatMessage,
  FloatingBarState,
  SectionId,
  UserProfile,
} from '@/types/ai';
import { getAIService } from '@/services/aiService';
import { getAgeGroup } from '@/services/aiConfig';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROFILE_STORAGE_KEY = 'health_ai_profile';
const ANNOTATIONS_STORAGE_KEY = 'health_ai_annotations';

const DEFAULT_FLOATING_BAR: FloatingBarState = {
  mode: 'welcome',
  icon: '\u{1F916}',
  message: '\u4F60\u597D\uFF01\u70B9\u51FB\u548C\u6211\u804A\u804A\uFF0C\u5E2E\u4F60\u5B9A\u5236\u4F53\u68C0\u65B9\u6848',
  actionLabel: '\u5F00\u59CB\u5BF9\u8BDD',
};

function getDefaultProfile(age: number): UserProfile {
  return {
    age,
    medicalHistory: '',
    budget: 'medium',
    concerns: '',
    onboardingComplete: false,
  };
}

// ---------------------------------------------------------------------------
// Section-specific floating bar hints
// ---------------------------------------------------------------------------

function getPackageLabel(age: number): string {
  const group = getAgeGroup(age);
  const labelMap: Record<string, string> = {
    basic: '\u57FA\u7840\u7248',
    comprehensive: '\u5168\u9762\u7248',
    premium: '\u9AD8\u7AEF\u7248',
  };
  return labelMap[group.recommendedPackage] ?? '\u5168\u9762\u7248';
}

function getBudgetLabel(budget: UserProfile['budget']): string {
  const map: Record<UserProfile['budget'], string> = {
    low: '\u4F4E\u9884\u7B97',
    medium: '\u4E2D\u7B49\u9884\u7B97',
    high: '\u9AD8\u9884\u7B97',
  };
  return map[budget];
}

function getChecklistFocus(age: number): string {
  const group = getAgeGroup(age);
  return group.focusPoints.slice(0, 2).join('\u3001');
}

function getSectionHint(sectionId: SectionId, profile: UserProfile): FloatingBarState {
  const { age, budget } = profile;
  const hints: Record<SectionId, FloatingBarState> = {
    packages: {
      mode: 'context',
      icon: '\u{1F4E6}',
      message: `${age}\u5C81\u5EFA\u8BAE\u9009\u62E9${getPackageLabel(age)}\uFF0C\u70B9\u51FB\u4E86\u89E3\u8BE6\u60C5`,
      actionLabel: '\u4E86\u89E3\u66F4\u591A',
    },
    hospitals: {
      mode: 'context',
      icon: '\u{1F3E5}',
      message: `\u6839\u636E\u60A8\u7684${getBudgetLabel(budget)}\uFF0C\u4E3A\u60A8\u63A8\u8350\u5408\u9002\u7684\u533B\u9662`,
      actionLabel: '\u67E5\u770B\u63A8\u8350',
    },
    checklist: {
      mode: 'context',
      icon: '\u2705',
      message: `${age}\u5C81\u9700\u91CD\u70B9\u5173\u6CE8${getChecklistFocus(age)}`,
      actionLabel: '\u67E5\u770B\u6E05\u5355',
    },
    policy: {
      mode: 'context',
      icon: '\u{1F4B0}',
      message: '\u7B26\u5408\u6761\u4EF6\u53EF\u7533\u8BF7\u514D\u8D39\u5B55\u68C0\uFF0C\u5148\u505A\u514D\u8D39\u9879\u76EE\u518D\u81EA\u8D39\u52A0\u505A',
      actionLabel: '\u4E86\u89E3\u653F\u7B56',
    },
    guide: {
      mode: 'context',
      icon: '\u{1F4C5}',
      message: '\u5EFA\u8BAE\u63D0\u524D3-6\u4E2A\u6708\u68C0\u67E5\uFF0C\u6708\u7ECF\u5E72\u51C0\u540E3-7\u5929\u6700\u4F73',
      actionLabel: '\u67E5\u770B\u6307\u5357',
    },
  };
  return hints[sectionId];
}

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AIContext = createContext<AIContextValue | null>(null);

export function useAIContext(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AIContextProviderProps {
  initialAge: number;
  children: ReactNode;
}

export function AIContextProvider({ initialAge, children }: AIContextProviderProps) {
  // ---- User profile ----
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const stored = loadFromStorage<UserProfile>(PROFILE_STORAGE_KEY);
    if (stored) {
      return { ...stored, age: initialAge };
    }
    return getDefaultProfile(initialAge);
  });

  // Sync age when initialAge prop changes (lifted from App.tsx)
  useEffect(() => {
    setUserProfile(prev => (prev.age === initialAge ? prev : { ...prev, age: initialAge }));
  }, [initialAge]);

  // Persist profile
  useEffect(() => {
    saveToStorage(PROFILE_STORAGE_KEY, userProfile);
  }, [userProfile]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // ---- Section tracking (IntersectionObserver) ----
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const sectionElements = useRef<Map<SectionId, HTMLElement>>(new Map());
  const ratios = useRef<Map<SectionId, number>>(new Map());

  const registerSection = useCallback((id: SectionId, element: HTMLElement) => {
    sectionElements.current.set(id, element);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sectionId as SectionId | undefined;
          if (id) {
            ratios.current.set(id, entry.intersectionRatio);
          }
        }

        // Determine most visible section
        let best: SectionId | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios.current.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (bestRatio > 0.1) {
          setActiveSection(best);
        }
      },
      { threshold: [0.1, 0.3, 0.5] },
    );

    // Observe registered elements — set data-section-id attribute for identification
    for (const [id, el] of sectionElements.current.entries()) {
      el.dataset.sectionId = id;
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [
    // Re-run when the set of registered sections changes.
    // We use sectionElements.current.size indirectly; the effect re-subscribes
    // whenever the provider re-renders with new children that call registerSection.
  ]);

  // ---- Annotations ----
  const [annotations, setAnnotationsRaw] = useState<Annotation[]>(() => {
    return loadFromStorage<Annotation[]>(ANNOTATIONS_STORAGE_KEY) ?? [];
  });

  const setAnnotations = useCallback((next: Annotation[]) => {
    setAnnotationsRaw(next);
    saveToStorage(ANNOTATIONS_STORAGE_KEY, next);
  }, []);

  const getAnnotationsForSection = useCallback(
    (sectionId: SectionId) => annotations.filter(a => a.sectionId === sectionId),
    [annotations],
  );

  const getAnnotationForItem = useCallback(
    (sectionId: SectionId, itemId: string) =>
      annotations.find(a => a.sectionId === sectionId && a.itemId === itemId),
    [annotations],
  );

  // ---- Panel open/close ----
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  // ---- Floating bar ----
  const [floatingBarState, setFloatingBarState] = useState<FloatingBarState>(DEFAULT_FLOATING_BAR);

  // Auto-update floating bar when active section changes
  useEffect(() => {
    if (isPanelOpen) return; // don't overwrite while chatting
    if (activeSection) {
      setFloatingBarState(getSectionHint(activeSection, userProfile));
    } else {
      setFloatingBarState(DEFAULT_FLOATING_BAR);
    }
  }, [activeSection, userProfile, isPanelOpen]);

  const showTermExplanation = useCallback((term: string, explanation: string) => {
    setFloatingBarState({
      mode: 'term',
      icon: '\u{1F4D6}',
      message: `${term}\uFF1A${explanation}`,
      actionLabel: '\u8BE6\u7EC6\u4E86\u89E3',
    });
  }, []);

  // ---- Chat state ----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const aiService = useMemo(() => getAIService(), []);

  // Sync age to existing aiService singleton
  useEffect(() => {
    aiService.setUserAge(userProfile.age);
  }, [aiService, userProfile.age]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = { role: 'user', content: content.trim(), timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // Add a placeholder assistant message for streaming
        const placeholderMsg: ChatMessage = { role: 'assistant', content: '', timestamp: Date.now() };
        setMessages(prev => [...prev, placeholderMsg]);

        await aiService.sendMessageStreaming(content.trim(), {
          context: activeSection || undefined,
          onChunk: (fullText) => {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText };
              return updated;
            });
          },
        });
      } catch {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: '\u62B1\u6B49\uFF0CAI \u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\u3002',
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [aiService, isLoading, activeSection],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    aiService.clearHistory();
  }, [aiService]);

  // ---- Assemble context value ----
  const value = useMemo<AIContextValue>(
    () => ({
      userProfile,
      updateUserProfile,
      activeSection,
      registerSection,
      annotations,
      setAnnotations,
      getAnnotationsForSection,
      getAnnotationForItem,
      isPanelOpen,
      openPanel,
      closePanel,
      floatingBarState,
      setFloatingBarState,
      showTermExplanation,
      messages,
      sendMessage,
      isLoading,
      clearHistory,
    }),
    [
      userProfile,
      updateUserProfile,
      activeSection,
      registerSection,
      annotations,
      setAnnotations,
      getAnnotationsForSection,
      getAnnotationForItem,
      isPanelOpen,
      openPanel,
      closePanel,
      floatingBarState,
      showTermExplanation,
      messages,
      sendMessage,
      isLoading,
      clearHistory,
    ],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
