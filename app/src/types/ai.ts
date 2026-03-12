// Section IDs that exist in the page
export type SectionId = 'packages' | 'hospitals' | 'checklist' | 'policy' | 'guide';

// User profile built during onboarding
export interface UserProfile {
  age: number;
  medicalHistory: string;
  budget: 'low' | 'medium' | 'high';
  concerns: string;
  onboardingComplete: boolean;
}

// Annotation types for page items
export type AnnotationType = 'recommended' | 'important' | 'optional';

export interface Annotation {
  sectionId: SectionId;
  itemId: string;
  type: AnnotationType;
  reason: string;
}

// Chat message
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
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  activeSection: SectionId | null;
  registerSection: (id: SectionId, element: HTMLElement) => void;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  getAnnotationsForSection: (sectionId: SectionId) => Annotation[];
  getAnnotationForItem: (sectionId: SectionId, itemId: string) => Annotation | undefined;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  floatingBarState: FloatingBarState;
  setFloatingBarState: (state: FloatingBarState) => void;
  showTermExplanation: (term: string, explanation: string) => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  clearHistory: () => void;
}
