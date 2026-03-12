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
        <span className="flex-1 text-left text-sm font-medium truncate">{floatingBarState.message}</span>
        <span className="flex-shrink-0 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
          {floatingBarState.actionLabel}
          <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </button>
    </div>
  );
}
