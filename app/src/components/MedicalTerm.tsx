import { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { MEDICAL_TERMS } from '@/services/aiConfig';
import { getAIService } from '@/services/aiService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MedicalTermProps {
  term: string;
  children: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

// 医学术语解释组件
export const MedicalTerm = ({ 
  term, 
  children, 
  showIcon = true,
  className = '' 
}: MedicalTermProps) => {
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedAI, setHasAskedAI] = useState(false);

  // 获取预设解释
  const presetExplanation = MEDICAL_TERMS[term] || MEDICAL_TERMS[Object.keys(MEDICAL_TERMS).find(k => term.includes(k)) || ''];

  // 向AI询问更详细的解释
  const askAI = async () => {
    if (hasAskedAI || isLoading) return;
    
    setIsLoading(true);
    try {
      const ai = getAIService();
      const response = await ai.sendMessage(`请用通俗易懂的语言解释"${term}"是什么，为什么备孕要检查这个指标，正常范围是多少。用中文回答。`);
      setAiExplanation(response.content);
      setHasAskedAI(true);
    } catch (error) {
      console.error('AI解释失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 如果没有预设解释且不需要显示图标，直接返回原文
  if (!presetExplanation && !showIcon) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Popover>
        <PopoverTrigger asChild>
          <span 
            className={`inline-flex items-center gap-1 cursor-help border-b-2 border-dashed border-teal-400 hover:border-coral-400 transition-colors ${className}`}
          >
            {children}
            {showIcon && (
              <HelpCircle className="w-3.5 h-3.5 text-teal-500 hover:text-coral-500 transition-colors" />
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0 bg-white rounded-2xl shadow-xl border-0 overflow-hidden"
          side="top"
          align="center"
          sideOffset={8}
        >
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {term}
              </h4>
            </div>
          </div>
          <div className="p-4">
            {/* 预设解释 */}
            {presetExplanation && (
              <p className="text-sm text-teal-700 leading-relaxed mb-3">
                {presetExplanation}
              </p>
            )}

            {/* AI详细解释 */}
            {aiExplanation && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-coral-600 font-medium mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI详细解读
                </p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {aiExplanation}
                </p>
              </div>
            )}

            {/* 询问AI按钮 */}
            {!aiExplanation && !isLoading && (
              <button
                onClick={askAI}
                className="mt-3 w-full py-2 px-3 bg-teal-50 hover:bg-teal-100 rounded-lg text-sm text-teal-600 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                让AI详细解释
              </button>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-teal-500">
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                AI正在思考...
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

// 简单版 - 仅Tooltip
export const MedicalTermSimple = ({ 
  term, 
  children,
  className = ''
}: MedicalTermProps) => {
  const explanation = MEDICAL_TERMS[term] || MEDICAL_TERMS[Object.keys(MEDICAL_TERMS).find(k => term.includes(k)) || ''];

  if (!explanation) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`border-b border-dashed border-teal-300 hover:border-coral-400 cursor-help transition-colors ${className}`}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 bg-white shadow-lg rounded-xl border-0"
        >
          <p className="text-sm text-teal-700">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// 医学术语列表组件 - 用于展示所有可解释的术语
export const MedicalTermsList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = Object.entries(MEDICAL_TERMS).filter(([term]) =>
    term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-teal-800 mb-4">医学术语词典</h3>
      
      {/* 搜索框 */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="搜索术语..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* 术语列表 */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredTerms.map(([term, explanation]) => (
          <div key={term} className="p-3 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-teal-800 mb-1">{term}</h4>
            <p className="text-sm text-teal-600/70">{explanation}</p>
          </div>
        ))}
        {filteredTerms.length === 0 && (
          <p className="text-center text-gray-400 py-4">未找到相关术语</p>
        )}
      </div>
    </div>
  );
};

export default MedicalTerm;
