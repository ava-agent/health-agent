import type { AnnotationType } from '@/types/ai';

const ANNOTATION_STYLES: Record<AnnotationType, { icon: string; label: string; className: string }> = {
  recommended: {
    icon: '\u{1F916}',
    label: 'AI\u63A8\u8350',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  important: {
    icon: '\u26A1',
    label: '\u91CD\u70B9\u5173\u6CE8',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  optional: {
    icon: '\u{1F4A1}',
    label: '\u53EF\u9009',
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
