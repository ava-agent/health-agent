import { useRef, useEffect, useState } from 'react';
import { useAIContext } from './AIContextProvider';
import { X, Send, Bot, User, Loader2, FileText, RotateCcw, FlaskConical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIReportCard } from './AIReportCard';
import { ReportInterpreter } from './ReportInterpreter';

function tryParseReport(content: string) {
  try {
    const data = JSON.parse(content);
    if (data.recommendedPackage && data.mustDoItems) return data;
  } catch {
    // not JSON — return null
  }
  return null;
}

function renderMessageContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const rendered = parts.map((part, j) => {
      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      return boldMatch ? (
        <strong key={j}>{boldMatch[1]}</strong>
      ) : (
        <span key={j}>{part}</span>
      );
    });
    return (
      <span key={i}>
        {i > 0 && <br />}
        {rendered}
      </span>
    );
  });
}

export function AIChatPanel() {
  const {
    messages,
    sendMessage,
    isLoading,
    clearHistory,
    isPanelOpen,
    closePanel,
    userProfile,
  } = useAIContext();

  const [inputValue, setInputValue] = useState('');
  const [showInterpreter, setShowInterpreter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGeneratePlan = () => {
    const profileSummary = `年龄${userProfile.age}岁，病史：${userProfile.medicalHistory || '无'}，预算：${userProfile.budget === 'low' ? '经济型' : userProfile.budget === 'high' ? '充足' : '中等'}，关注：${userProfile.concerns || '无'}`;
    sendMessage(`请根据以下用户画像生成个性化体检计划报告：${profileSummary}`);
  };

  const profileStatus = userProfile.onboardingComplete
    ? `${userProfile.age}岁 · 已建档`
    : `${userProfile.age}岁 · 对话中`;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${
        isPanelOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 -z-10"
        onClick={closePanel}
        role="presentation"
      />

      {/* Panel */}
      <div className="h-[60vh] max-h-[600px] bg-white rounded-t-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-t-3xl px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">AI 备孕顾问</h3>
            <p className="text-white/70 text-xs">{profileStatus}</p>
          </div>
          <button
            onClick={() => {
              clearHistory();
            }}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="重置对话"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={closePanel}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="关闭面板"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="bg-gray-100 text-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[85%]">
                  你好！我是 AI 备孕顾问 🤗 先回答几个问题，我来为你定制专属体检方案。请问你今年多大了？
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-teal-600" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-coral-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant' && tryParseReport(msg.content)
                    ? <AIReportCard data={tryParseReport(msg.content)!} />
                    : renderMessageContent(msg.content)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-coral-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-coral-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  思考中...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Action buttons */}
        {userProfile.onboardingComplete && messages.length > 0 && !isLoading && (
          <div className="px-4 pb-2 space-y-2">
            <button
              onClick={handleGeneratePlan}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              生成我的体检计划
            </button>
            <button
              onClick={() => setShowInterpreter(!showInterpreter)}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 rounded-xl text-sm text-amber-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <FlaskConical className="w-4 h-4" />
              {showInterpreter ? '收起报告解读' : '解读检查报告'}
            </button>
            {showInterpreter && <ReportInterpreter />}
          </div>
        )}

        {/* Input area */}
        <div className="p-4 pt-2 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              disabled={isLoading}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              className="bg-teal-500 text-white rounded-xl px-4 py-2.5 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              aria-label="发送消息"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
