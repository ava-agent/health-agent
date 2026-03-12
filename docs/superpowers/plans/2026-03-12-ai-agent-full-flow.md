# AI Agent Full-Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the AI from an isolated floating chatbot to a full-journey intelligent companion with smart floating bar, context-aware suggestions, page annotations, and personalized report generation.

**Architecture:** Replace `AIAssistant.tsx` with a layered system: `AIContextProvider` (React Context for user profile, visible section, annotations) → `AIFloatingBar` (always-visible bottom bar with context-aware one-liner) → `AIChatPanel` (expandable dialog panel with onboarding, chat, report generation). Backend calls go through Supabase Edge Function to GLM API with streaming support.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, shadcn/ui, Supabase Edge Functions (Deno), GLM API (OpenAI-compatible), IntersectionObserver, SSE streaming

**Spec:** `docs/superpowers/specs/2026-03-12-ai-agent-full-flow-design.md`

---

## Chunk 1: AI Context Engine + Types

### Task 1: AI Types & Interfaces

**Files:**
- Create: `app/src/types/ai.ts`

- [ ] **Step 1: Create shared AI type definitions**

```typescript
// app/src/types/ai.ts

// Section IDs that exist in the page
export type SectionId = 'packages' | 'hospitals' | 'checklist' | 'policy' | 'guide';

// User profile built during onboarding
export interface UserProfile {
  age: number;
  medicalHistory: string;    // free-text from onboarding
  budget: 'low' | 'medium' | 'high';
  concerns: string;          // free-text from onboarding
  onboardingComplete: boolean;
}

// Annotation types for page items
export type AnnotationType = 'recommended' | 'important' | 'optional';

export interface Annotation {
  sectionId: SectionId;
  itemId: string;           // e.g. package id, hospital name, checklist item name
  type: AnnotationType;
  reason: string;
}

// Chat message (extends existing)
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// Floating bar state
export type FloatingBarMode = 'welcome' | 'context' | 'term' | 'custom';

export interface FloatingBarState {
  mode: FloatingBarMode;
  icon: string;
  message: string;
  actionLabel: string;
}

// AI context exposed to all components
export interface AIContextValue {
  // User profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Current visible section
  activeSection: SectionId | null;
  registerSection: (id: SectionId, element: HTMLElement) => void;

  // Annotations
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  getAnnotationsForSection: (sectionId: SectionId) => Annotation[];
  getAnnotationForItem: (sectionId: SectionId, itemId: string) => Annotation | undefined;

  // Chat panel
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;

  // Floating bar
  floatingBarState: FloatingBarState;
  setFloatingBarState: (state: FloatingBarState) => void;
  showTermExplanation: (term: string, explanation: string) => void;

  // Chat
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  clearHistory: () => void;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `ai.ts`

- [ ] **Step 3: Commit**

```bash
git add app/src/types/ai.ts
git commit -m "feat(ai): add shared type definitions for AI agent system"
```

---

### Task 2: AI Context Provider

**Files:**
- Create: `app/src/components/ai/AIContextProvider.tsx`
- Reference: `app/src/types/ai.ts`

- [ ] **Step 1: Create AIContextProvider with IntersectionObserver, profile management, and annotation storage**

The provider manages:
1. `UserProfile` — persisted to localStorage, built during onboarding
2. `activeSection` — tracked via IntersectionObserver on registered section elements
3. `annotations` — array set after onboarding, queried by section components
4. `floatingBarState` — controls what the floating bar displays
5. `messages` / `sendMessage` / `isLoading` — chat state delegating to `aiService`

```typescript
// app/src/components/ai/AIContextProvider.tsx
import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { AIContextValue, SectionId, UserProfile, Annotation, FloatingBarState, ChatMessage } from '@/types/ai';

const defaultProfile: UserProfile = {
  age: 29,
  medicalHistory: '',
  budget: 'medium',
  concerns: '',
  onboardingComplete: false,
};

const PROFILE_KEY = 'health_ai_profile';
const ANNOTATIONS_KEY = 'health_ai_annotations';

function loadProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

function loadAnnotations(): Annotation[] {
  try {
    const saved = localStorage.getItem(ANNOTATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Section-specific context prompts for the floating bar
const SECTION_HINTS: Record<SectionId, (profile: UserProfile) => FloatingBarState> = {
  packages: (p) => ({
    mode: 'context',
    icon: '💡',
    message: `${p.age}岁建议选择${p.age <= 28 ? '基础版' : p.age <= 35 ? '全面版' : '高端版'}，点击了解详情`,
    actionLabel: '详细分析',
  }),
  hospitals: (p) => ({
    mode: 'context',
    icon: '🏥',
    message: `根据您的${p.budget === 'low' ? '经济' : p.budget === 'high' ? '高端' : '中等'}预算，为您推荐合适的医院`,
    actionLabel: '看推荐',
  }),
  checklist: (p) => ({
    mode: 'context',
    icon: '📋',
    message: `${p.age}岁需重点关注${p.age >= 33 ? 'AMH、性激素六项和卵巢储备评估' : 'AMH和甲状腺功能'}`,
    actionLabel: '查看建议',
  }),
  policy: () => ({
    mode: 'context',
    icon: '🆓',
    message: '符合条件可申请免费孕检，先做免费项目再自费加做，省钱又全面',
    actionLabel: '了解更多',
  }),
  guide: () => ({
    mode: 'context',
    icon: '📅',
    message: '建议提前3-6个月检查，月经干净后3-7天最佳',
    actionLabel: '查看详情',
  }),
};

const WELCOME_STATE: FloatingBarState = {
  mode: 'welcome',
  icon: '🤖',
  message: '你好！点击和我聊聊，帮你定制体检方案',
  actionLabel: '开始对话',
};

const AIContext = createContext<AIContextValue | null>(null);

export function useAIContext(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAIContext must be used within AIContextProvider');
  return ctx;
}

export function AIContextProvider({ children, initialAge }: { children: ReactNode; initialAge?: number }) {
  // --- User Profile ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const loaded = loadProfile();
    return initialAge ? { ...loaded, age: initialAge } : loaded;
  });

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Sync external age changes
  useEffect(() => {
    if (initialAge && initialAge !== userProfile.age) {
      updateUserProfile({ age: initialAge });
    }
  }, [initialAge, userProfile.age, updateUserProfile]);

  // --- Section Tracking ---
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<SectionId, HTMLElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let maxRatio = 0;
        let mostVisible: SectionId | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisible = entry.target.id as SectionId;
          }
        }
        if (mostVisible) setActiveSection(mostVisible);
      },
      { threshold: [0.1, 0.3, 0.5] }
    );

    // Observe already-registered sections
    sectionsRef.current.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const registerSection = useCallback((id: SectionId, element: HTMLElement) => {
    sectionsRef.current.set(id, element);
    observerRef.current?.observe(element);
  }, []);

  // --- Annotations ---
  const [annotations, setAnnotationsState] = useState<Annotation[]>(loadAnnotations);

  const setAnnotations = useCallback((anns: Annotation[]) => {
    setAnnotationsState(anns);
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(anns));
  }, []);

  const getAnnotationsForSection = useCallback(
    (sectionId: SectionId) => annotations.filter(a => a.sectionId === sectionId),
    [annotations]
  );

  const getAnnotationForItem = useCallback(
    (sectionId: SectionId, itemId: string) =>
      annotations.find(a => a.sectionId === sectionId && a.itemId === itemId),
    [annotations]
  );

  // --- Panel State ---
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  // --- Floating Bar ---
  const [floatingBarState, setFloatingBarState] = useState<FloatingBarState>(WELCOME_STATE);

  // Auto-update floating bar based on active section
  useEffect(() => {
    if (isPanelOpen) return; // Don't update while panel is open
    if (!activeSection) {
      setFloatingBarState(WELCOME_STATE);
      return;
    }
    const hintFn = SECTION_HINTS[activeSection];
    if (hintFn) {
      setFloatingBarState(hintFn(userProfile));
    }
  }, [activeSection, userProfile, isPanelOpen]);

  const showTermExplanation = useCallback((term: string, explanation: string) => {
    setFloatingBarState({
      mode: 'term',
      icon: '📖',
      message: `${term}：${explanation}`,
      actionLabel: '问更多',
    });
  }, []);

  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // sendMessage will be implemented in Task 4 when we update aiService
  // For now, placeholder that will be replaced
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    const userMsg: ChatMessage = { role: 'user', content: content.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    try {
      // Temporary: will be replaced with streaming aiService call
      const { getAIService } = await import('@/services/aiService');
      const ai = getAIService();
      ai.setUserAge(userProfile.age);
      const response = await ai.sendMessage(content.trim());
      setMessages(prev => [...prev, response]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI 服务暂时不可用。', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, userProfile.age]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  // --- Context Value ---
  const value: AIContextValue = {
    userProfile, updateUserProfile,
    activeSection, registerSection,
    annotations, setAnnotations, getAnnotationsForSection, getAnnotationForItem,
    isPanelOpen, openPanel, closePanel,
    floatingBarState, setFloatingBarState, showTermExplanation,
    messages, sendMessage, isLoading, clearHistory,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd app && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/src/components/ai/AIContextProvider.tsx
git commit -m "feat(ai): add AIContextProvider with section tracking, profile, and annotations"
```

---

### Task 3: Wire AIContextProvider into App.tsx

**Files:**
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Replace AIAssistant with AIContextProvider in App.tsx**

Changes:
1. Import `AIContextProvider` instead of `AIAssistant`
2. Wrap all content in `<AIContextProvider initialAge={userAge}>`
3. Remove `<AIAssistant userAge={userAge} />`
4. Add placeholder comments where `AIFloatingBar` will go (Task 5)

```tsx
// In App.tsx:
// Remove: import AIAssistant from './components/AIAssistant';
// Add:    import { AIContextProvider } from './components/ai/AIContextProvider';

// Change return to:
return (
  <AIContextProvider initialAge={userAge}>
    <div className="min-h-screen bg-mint-50 font-sans">
      <Navigation />
      <main>
        <HeroSection onAgeChange={handleAgeChange} />
        <PackageSection userAge={userAge} />
        <HospitalSection />
        <ChecklistSection />
        <PolicySection />
        <GuideSection />
        <CTASection userAge={userAge} />
      </main>
      <Footer userAge={userAge} />
      {/* AIFloatingBar + AIChatPanel will be added in Task 5 & 6 */}
    </div>
  </AIContextProvider>
);
```

- [ ] **Step 2: Verify build succeeds**

Run: `cd app && npm run build 2>&1 | tail -10`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add app/src/App.tsx
git commit -m "feat(ai): wire AIContextProvider into App, remove old AIAssistant"
```

---

### Task 4: Register Sections with IntersectionObserver

**Files:**
- Modify: `app/src/sections/PackageSection.tsx`
- Modify: `app/src/sections/HospitalSection.tsx`
- Modify: `app/src/sections/ChecklistSection.tsx`
- Modify: `app/src/sections/PolicySection.tsx`
- Modify: `app/src/sections/GuideSection.tsx`

- [ ] **Step 1: Add section registration hook**

In each section component, add a `useRef` + `useEffect` to register with the AI context. Pattern for each file:

```tsx
import { useRef, useEffect } from 'react';
import { useAIContext } from '@/components/ai/AIContextProvider';

// Inside the component:
const sectionRef = useRef<HTMLElement>(null);
const { registerSection } = useAIContext();

useEffect(() => {
  if (sectionRef.current) {
    registerSection('<section-id>', sectionRef.current);
  }
}, [registerSection]);

// On the root element, change from:
//   <section id="packages" ...>
// To:
//   <section id="packages" ref={sectionRef} ...>
```

Apply to all 5 sections with their respective IDs:
- `PackageSection.tsx` → `registerSection('packages', ...)`
- `HospitalSection.tsx` → `registerSection('hospitals', ...)`
- `ChecklistSection.tsx` → `registerSection('checklist', ...)`
- `PolicySection.tsx` → `registerSection('policy', ...)`
- `GuideSection.tsx` → `registerSection('guide', ...)`

- [ ] **Step 2: Verify build succeeds**

Run: `cd app && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/src/sections/PackageSection.tsx app/src/sections/HospitalSection.tsx app/src/sections/ChecklistSection.tsx app/src/sections/PolicySection.tsx app/src/sections/GuideSection.tsx
git commit -m "feat(ai): register all sections with AIContext IntersectionObserver"
```

---

## Chunk 2: Smart Floating Bar + Chat Panel UI

### Task 5: AIFloatingBar Component

**Files:**
- Create: `app/src/components/ai/AIFloatingBar.tsx`
- Modify: `app/src/App.tsx` (add to render)

- [ ] **Step 1: Create AIFloatingBar**

The floating bar:
- Fixed at bottom of viewport
- Shows icon + message + action button from `floatingBarState`
- Click action button or bar → opens panel (`openPanel()`)
- Smooth slide-up animation
- Hidden when panel is open

```tsx
// app/src/components/ai/AIFloatingBar.tsx
import { useAIContext } from './AIContextProvider';
import { ChevronUp } from 'lucide-react';

export function AIFloatingBar() {
  const { floatingBarState, isPanelOpen, openPanel } = useAIContext();

  if (isPanelOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <button
        onClick={openPanel}
        className="w-full max-w-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl px-5 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
      >
        <span className="text-lg flex-shrink-0">{floatingBarState.icon}</span>
        <span className="flex-1 text-left text-sm font-medium truncate">
          {floatingBarState.message}
        </span>
        <span className="flex-shrink-0 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
          {floatingBarState.actionLabel}
          <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add AIFloatingBar to App.tsx**

```tsx
// Add import:
import { AIFloatingBar } from './components/ai/AIFloatingBar';

// Add inside AIContextProvider, after Footer:
<AIFloatingBar />
```

- [ ] **Step 3: Verify build and visual**

Run: `cd app && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ai/AIFloatingBar.tsx app/src/App.tsx
git commit -m "feat(ai): add smart floating bar with context-aware suggestions"
```

---

### Task 6: AIChatPanel Component

**Files:**
- Create: `app/src/components/ai/AIChatPanel.tsx`
- Modify: `app/src/App.tsx` (add to render)

- [ ] **Step 1: Create AIChatPanel**

The chat panel:
- Slides up from bottom when `isPanelOpen` is true
- Height ~60vh on desktop, full screen on mobile
- Header with title + close button
- Message list (reuse safe markdown rendering from old AIAssistant)
- Input area at bottom
- "生成我的体检计划" button when onboarding is complete

```tsx
// app/src/components/ai/AIChatPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, FileText, RotateCcw } from 'lucide-react';
import { useAIContext } from './AIContextProvider';
import { ScrollArea } from '@/components/ui/scroll-area';

// Safe markdown rendering (from old AIAssistant)
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  return (
    <span>
      {lines.map((line, lineIdx) => {
        const displayLine = line.replace(/^-\s/, '• ');
        const parts = displayLine.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parts.map((part, partIdx) => {
              const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
              return boldMatch
                ? <strong key={partIdx}>{boldMatch[1]}</strong>
                : <span key={partIdx}>{part}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
}

export function AIChatPanel() {
  const {
    isPanelOpen, closePanel,
    messages, sendMessage, isLoading, clearHistory,
    userProfile,
  } = useAIContext();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isPanelOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isPanelOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isPanelOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={closePanel}
        />
      )}

      {/* Panel */}
      <div className="bg-white rounded-t-3xl shadow-2xl h-[60vh] sm:h-[60vh] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-3xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">AI 备孕顾问</h3>
              <p className="text-white/60 text-xs">
                {userProfile.onboardingComplete ? `已了解您的情况 · ${userProfile.age}岁` : '在线'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="重新开始"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={closePanel}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      你好！我是 AI 备孕顾问 🤗 先回答几个问题，我来为你定制专属体检方案。
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      请问你今年多大了？
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-coral-100' : 'bg-teal-100'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-coral-600" />
                    : <Bot className="w-4 h-4 text-teal-600" />
                  }
                </div>
                <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block text-left rounded-2xl p-3 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-coral-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">
                      {renderMarkdown(msg.content)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                  <span className="text-sm text-gray-500">思考中...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Generate Report Button */}
        {userProfile.onboardingComplete && messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-gray-100">
            <button
              onClick={() => sendMessage('请根据我的情况，生成一份个性化体检计划报告')}
              className="w-full py-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-sm text-teal-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              生成我的体检计划
            </button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            AI回答仅供参考，具体问题请咨询医生
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add AIChatPanel to App.tsx**

```tsx
import { AIChatPanel } from './components/ai/AIChatPanel';

// After <AIFloatingBar />:
<AIChatPanel />
```

- [ ] **Step 3: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Manual test — dev server**

Run: `cd app && npm run dev`
1. See floating bar at bottom with welcome message
2. Click floating bar → panel slides up
3. Type a message → get response (demo mode)
4. Click X → panel closes, floating bar reappears
5. Scroll through sections → floating bar message changes

- [ ] **Step 5: Commit**

```bash
git add app/src/components/ai/AIChatPanel.tsx app/src/App.tsx
git commit -m "feat(ai): add chat panel with slide-up animation and message UI"
```

---

## Chunk 3: GLM API Integration + Streaming

### Task 7: Update Edge Function for GLM + Streaming

**Files:**
- Create: `supabase/functions/health-chat/index.ts` (local copy for reference/deploy)

- [ ] **Step 1: Create updated Edge Function**

The Edge Function needs to:
1. Accept `{ message, conversationId, sessionId, userAge, context?, action? }`
2. `action: 'chat'` (default) — normal chat with streaming
3. `action: 'annotations'` — generate page annotations JSON
4. `action: 'report'` — generate personalized report JSON
5. Use `AI_BASE_URL` (GLM endpoint) and `AI_MODEL` (GLM model ID)
6. Return streaming SSE for chat, JSON for annotations/report

```typescript
// supabase/functions/health-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `你是一位专业的备孕健康顾问，擅长用通俗易懂的语言解答备孕体检相关问题。
服务上海地区备孕人群。回答温暖鼓励，避免过度专业，给出具体可操作建议，不涉及诊断治疗。`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationId, sessionId, userAge, context, action = 'chat' } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const baseUrl = Deno.env.get('AI_BASE_URL') || 'https://open.bigmodel.cn/api/paas/v4';
    const model = Deno.env.get('AI_MODEL') || 'glm-4-flash';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPT;
    if (userAge) systemPrompt += `\n\n用户年龄：${userAge}岁。`;
    if (context) systemPrompt += `\n\n用户当前正在浏览：${context}`;

    // Action-specific prompts
    if (action === 'annotations') {
      systemPrompt += `\n\n请根据用户画像生成页面标注建议。返回严格的JSON数组格式：
[{"sectionId":"packages|hospitals|checklist","itemId":"项目名","type":"recommended|important|optional","reason":"原因"}]
只返回JSON，不要其他文字。`;
    } else if (action === 'report') {
      systemPrompt += `\n\n请生成个性化体检计划报告。返回严格的JSON格式：
{"recommendedPackage":"basic|comprehensive|premium","packageReason":"理由","mustDoItems":["项目"],"focusItems":["重点项目"],"recommendedHospitals":["医院"],"budgetEstimate":"预算","timeline":"时间建议","tips":["贴士"]}
只返回JSON，不要其他文字。`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const stream = action === 'chat';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} ${error}`);
    }

    // Non-streaming (annotations, report)
    if (!stream) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ content, conversationId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Streaming (chat)
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch {
                // Skip unparseable chunks
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

- [ ] **Step 2: Deploy Edge Function**

Run: `supabase functions deploy health-chat --no-verify-jwt`

Set secrets in Supabase Dashboard:
- `OPENAI_API_KEY` → GLM API key
- `AI_BASE_URL` → `https://open.bigmodel.cn/api/paas/v4`
- `AI_MODEL` → `glm-4-flash`

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/health-chat/index.ts
git commit -m "feat(ai): update Edge Function for GLM API with streaming support"
```

---

### Task 8: Update aiService for Streaming

**Files:**
- Modify: `app/src/services/aiService.ts`

- [ ] **Step 1: Add streaming support to aiService**

Replace the existing `callEdgeFunction` with a streaming version that yields tokens incrementally. Add a new `sendMessageStreaming` method that accepts an `onChunk` callback.

Key changes:
1. New `sendMessageStreaming(message, options)` method
2. `options` includes: `context?: string`, `action?: string`, `onChunk?: (text: string) => void`
3. For streaming: read SSE, call `onChunk` for each token, return full assembled message
4. For non-streaming (`action: 'annotations' | 'report'`): return JSON directly
5. Keep `sendMessage` as non-streaming wrapper for backward compatibility

```typescript
// Add to AIService class:

interface SendOptions {
  context?: string;
  action?: 'chat' | 'annotations' | 'report';
  onChunk?: (text: string) => void;
  userProfileJson?: string;
}

async sendMessageStreaming(message: string, options: SendOptions = {}): Promise<ChatMessage> {
  const { context, action = 'chat', onChunk, userProfileJson } = options;

  this.conversationHistory.push({ role: 'user', content: message, timestamp: Date.now() });

  let fullContent = '';

  if (this.config.demoMode) {
    await this.simulateDelay(800);
    fullContent = getDemoResponse(message);
    onChunk?.(fullContent);
  } else {
    fullContent = await this.callEdgeFunctionStreaming(message, { context, action, onChunk, userProfileJson });
  }

  const assistantMsg: ChatMessage = { role: 'assistant', content: fullContent, timestamp: Date.now() };
  this.conversationHistory.push(assistantMsg);

  if (this.conversationHistory.length > 20) {
    this.conversationHistory = this.conversationHistory.slice(-20);
  }

  return assistantMsg;
}

private async callEdgeFunctionStreaming(
  message: string,
  options: SendOptions
): Promise<string> {
  if (!supabase) {
    return '⚠️ 未配置Supabase，请检查环境变量。';
  }

  const { context, action = 'chat', onChunk, userProfileJson } = options;

  try {
    const body = {
      message: userProfileJson ? `${message}\n\n用户画像：${userProfileJson}` : message,
      conversationId: this.conversationId,
      sessionId: getSessionId(),
      userAge: this.userAge,
      context,
      action,
    };

    // Non-streaming actions
    if (action !== 'chat') {
      const { data, error } = await supabase.functions.invoke('health-chat', { body });
      if (error) throw error;
      if (data?.conversationId) this.conversationId = data.conversationId;
      return data?.content || '';
    }

    // Streaming chat
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            fullText += parsed.content;
            onChunk?.(fullText);
          }
        } catch {
          // skip
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error('Streaming Error:', error);
    return `⚠️ AI服务出错：${error instanceof Error ? error.message : '未知错误'}`;
  }
}
```

- [ ] **Step 2: Update AIContextProvider's sendMessage to use streaming**

In `AIContextProvider.tsx`, update `sendMessage` to use `sendMessageStreaming` with `onChunk` that updates the last assistant message incrementally.

- [ ] **Step 3: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add app/src/services/aiService.ts app/src/components/ai/AIContextProvider.tsx
git commit -m "feat(ai): add streaming support to aiService and wire into context"
```

---

## Chunk 4: Page Annotations + MedicalTerm Integration

### Task 9: AIAnnotation Component

**Files:**
- Create: `app/src/components/ai/AIAnnotation.tsx`

- [ ] **Step 1: Create annotation badge component**

```tsx
// app/src/components/ai/AIAnnotation.tsx
import type { AnnotationType } from '@/types/ai';

const ANNOTATION_STYLES: Record<AnnotationType, { icon: string; label: string; className: string }> = {
  recommended: {
    icon: '🤖',
    label: 'AI推荐',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  important: {
    icon: '⚡',
    label: '重点关注',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  optional: {
    icon: '💡',
    label: '可选',
    className: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

interface AIAnnotationProps {
  type: AnnotationType;
  reason?: string;
  compact?: boolean;
}

export function AIAnnotationBadge({ type, reason, compact = false }: AIAnnotationProps) {
  const style = ANNOTATION_STYLES[type];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style.className}`}>
        {style.icon} {style.label}
      </span>
    );
  }

  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${style.className}`}>
      <span className="text-sm flex-shrink-0">{style.icon}</span>
      <div>
        <span className="text-xs font-medium">{style.label}</span>
        {reason && <p className="text-xs mt-0.5 opacity-75">{reason}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/ai/AIAnnotation.tsx
git commit -m "feat(ai): add AIAnnotation badge component"
```

---

### Task 10: Integrate Annotations into PackageSection

**Files:**
- Modify: `app/src/sections/PackageSection.tsx`

- [ ] **Step 1: Add annotation badges to package cards**

Import `useAIContext` and `AIAnnotationBadge`. For each package card, check if there's an annotation and render the badge.

```tsx
// Add imports:
import { useAIContext } from '@/components/ai/AIContextProvider';
import { AIAnnotationBadge } from '@/components/ai/AIAnnotation';

// Inside component:
const { getAnnotationForItem } = useAIContext();

// Inside each package card render, after the price:
const annotation = getAnnotationForItem('packages', pkg.id);
{annotation && (
  <AIAnnotationBadge type={annotation.type} reason={annotation.reason} compact />
)}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
git add app/src/sections/PackageSection.tsx
git commit -m "feat(ai): integrate annotation badges into PackageSection"
```

---

### Task 11: Integrate Annotations into ChecklistSection & HospitalSection

**Files:**
- Modify: `app/src/sections/ChecklistSection.tsx`
- Modify: `app/src/sections/HospitalSection.tsx`

- [ ] **Step 1: Add annotation badges to checklist items**

Same pattern as Task 10: import `useAIContext` + `AIAnnotationBadge`, check for annotation on each checklist item (use item name as `itemId`), render badge.

- [ ] **Step 2: Add annotation badges to hospital cards**

Same pattern: check annotation for each hospital (use hospital name as `itemId`), render badge.

- [ ] **Step 3: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add app/src/sections/ChecklistSection.tsx app/src/sections/HospitalSection.tsx
git commit -m "feat(ai): integrate annotation badges into ChecklistSection and HospitalSection"
```

---

### Task 12: Update MedicalTerm to Use Floating Bar

**Files:**
- Modify: `app/src/components/MedicalTerm.tsx`

- [ ] **Step 1: Add floating bar notification on term click**

When a MedicalTerm popover opens, notify the floating bar via `showTermExplanation`.

```tsx
// Add import:
import { useAIContext } from '@/components/ai/AIContextProvider';

// Inside MedicalTerm component:
const { showTermExplanation } = useAIContext();

// In the PopoverTrigger onClick (or onOpenChange of Popover):
// When popover opens:
if (presetExplanation) {
  showTermExplanation(term, presetExplanation);
}
```

- [ ] **Step 2: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
git add app/src/components/MedicalTerm.tsx
git commit -m "feat(ai): MedicalTerm notifies floating bar on term click"
```

---

## Chunk 5: AI Onboarding + Report Generation

### Task 13: AI Onboarding Flow

**Files:**
- Modify: `app/src/components/ai/AIContextProvider.tsx`

- [ ] **Step 1: Add onboarding logic to sendMessage**

When the panel opens and `onboardingComplete` is false, the AI drives a structured Q&A:
1. First message asks age (pre-filled from slider)
2. Second asks about medical history
3. Third asks about budget
4. Fourth asks about concerns
5. After collecting answers, set `onboardingComplete: true` and trigger annotation generation

Add an `onboardingStep` state to track progress. Intercept `sendMessage` to extract profile data from user answers and advance the step.

The system prompt for onboarding should instruct GLM to ask one question at a time and extract structured data.

- [ ] **Step 2: Trigger annotation generation after onboarding**

After onboarding completes, call `aiService.sendMessageStreaming` with `action: 'annotations'` and the user profile. Parse the returned JSON and call `setAnnotations()`.

- [ ] **Step 3: Verify build and manual test**

Run: `cd app && npm run build 2>&1 | tail -10`
Manual: Open panel → AI asks questions → answer → annotations appear on page

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ai/AIContextProvider.tsx
git commit -m "feat(ai): add onboarding flow with profile collection and annotation generation"
```

---

### Task 14: Report Generation

**Files:**
- Create: `app/src/components/ai/AIReportCard.tsx`
- Modify: `app/src/components/ai/AIChatPanel.tsx`

- [ ] **Step 1: Create AIReportCard component**

Renders a structured report card from JSON data:
- Recommended package with reason
- Must-do items list
- Focus items with emphasis
- Recommended hospitals
- Budget estimate
- Timeline suggestion
- Tips

```tsx
// app/src/components/ai/AIReportCard.tsx
interface ReportData {
  recommendedPackage: string;
  packageReason: string;
  mustDoItems: string[];
  focusItems: string[];
  recommendedHospitals: string[];
  budgetEstimate: string;
  timeline: string;
  tips: string[];
}

export function AIReportCard({ data }: { data: ReportData }) {
  // Render as a styled card with sections for each field
  // Use teal/coral color scheme consistent with the site
}
```

- [ ] **Step 2: Update AIChatPanel to detect and render report JSON**

When a message content starts with `{` and contains `recommendedPackage`, parse it as report JSON and render `AIReportCard` instead of plain text.

- [ ] **Step 3: Update "生成我的体检计划" button handler**

The button should call `sendMessage` with `action: 'report'` and include the user profile in the request.

- [ ] **Step 4: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 5: Commit**

```bash
git add app/src/components/ai/AIReportCard.tsx app/src/components/ai/AIChatPanel.tsx
git commit -m "feat(ai): add report generation with structured card rendering"
```

---

### Task 15: Report Interpreter (Optional Feature)

**Files:**
- Create: `app/src/components/ai/ReportInterpreter.tsx`
- Modify: `app/src/components/ai/AIChatPanel.tsx`

- [ ] **Step 1: Create ReportInterpreter input component**

A form where users can input test result values (e.g., AMH value, TSH value) and get AI interpretation.

```tsx
// Simple form with common test fields:
// - AMH (ng/ml)
// - TSH (mIU/L)
// - FSH (IU/L)
// - Free text for other values
// Submit → sends formatted message to AI for interpretation
```

- [ ] **Step 2: Add "解读报告" tab/button in AIChatPanel**

Add a toggle in the panel header or as a quick action to switch to report interpreter mode.

- [ ] **Step 3: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add app/src/components/ai/ReportInterpreter.tsx app/src/components/ai/AIChatPanel.tsx
git commit -m "feat(ai): add report interpreter for test result analysis"
```

---

## Chunk 6: Cleanup + Deploy

### Task 16: Remove Old AIAssistant

**Files:**
- Delete: `app/src/components/AIAssistant.tsx`

- [ ] **Step 1: Delete old AIAssistant.tsx**

Verify no other files import it (should have been removed in Task 3).

Run: `grep -r "AIAssistant" app/src/ --include="*.tsx" --include="*.ts"`
Expected: No results

- [ ] **Step 2: Delete file**

```bash
rm app/src/components/AIAssistant.tsx
```

- [ ] **Step 3: Verify build**

Run: `cd app && npm run build 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old AIAssistant component"
```

---

### Task 17: Environment Variables + Final Config

**Files:**
- Modify: `app/.env` (or `.env.local`)

- [ ] **Step 1: Update environment variables**

Set `VITE_DEMO_MODE=false` to enable real API calls.

Ensure Supabase secrets are configured:
- `OPENAI_API_KEY` → GLM API key
- `AI_BASE_URL` → `https://open.bigmodel.cn/api/paas/v4`
- `AI_MODEL` → `glm-4-flash`

- [ ] **Step 2: Full build and manual smoke test**

Run: `cd app && npm run build 2>&1 | tail -10`
Run: `cd app && npm run preview`

Test:
1. Page loads, floating bar visible at bottom
2. Scroll through sections → floating bar updates
3. Click floating bar → panel opens
4. Complete onboarding → annotations appear on page
5. Ask questions → streaming responses
6. Click medical term → floating bar shows explanation
7. Generate report → structured card appears
8. Close panel → floating bar returns

- [ ] **Step 3: Deploy**

```bash
cd app && vercel deploy --prod --yes
```

- [ ] **Step 4: Commit any remaining changes**

```bash
git add -A
git commit -m "feat(ai): complete AI agent full-flow integration"
```
