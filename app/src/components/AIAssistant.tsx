import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { getAIService, type ChatMessage } from '@/services/aiService';
import { ScrollArea } from '@/components/ui/scroll-area';

// 快捷问题
const QUICK_QUESTIONS = [
  'AMH是什么？',
  'TORCH检查包括什么？',
  '性激素六项是什么？',
  '什么时候去检查最好？',
  '检查前要准备什么？',
  '免费政策怎么申请？',
  '叶酸怎么补？',
];

// 年龄相关建议
const AGE_ADVICE: Record<string, string[]> = {
  '25-28': [
    '25-28岁是生育黄金期，卵巢功能良好',
    '建议做基础检查即可',
    '重点关注营养状况和生活方式',
    'AMH正常值在2.0-6.8 ng/ml',
  ],
  '29-32': [
    '29-32岁生育力依然良好',
    '建议加做AMH检测评估卵巢储备',
    '关注甲状腺功能',
    '别忘了口腔检查',
  ],
  '33-35': [
    '33-35岁生育力开始下降',
    '必做AMH和性激素六项',
    '建议全面评估卵巢功能',
    'AMH正常值在1.0-3.0 ng/ml',
  ],
  '36-40': [
    '36-40岁属于高龄备孕',
    '建议做高端全面检查',
    '考虑染色体检查',
    '建议咨询遗传专家',
  ],
};

interface AIAssistantProps {
  userAge?: number;
}

const AIAssistant = ({ userAge }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiService = getAIService();

  // 同步用户年龄到 AI 服务
  useEffect(() => {
    if (userAge) {
      aiService.setUserAge(userAge);
    }
  }, [userAge, aiService]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setShowQuickQuestions(false);
    setHasStarted(true);

    // 添加用户消息
    const userMsg: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    try {
      // 获取AI回复
      const response = await aiService.sendMessage(content.trim());
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置对话
  const resetConversation = () => {
    aiService.clearHistory();
    setMessages([]);
    setShowQuickQuestions(true);
    setHasStarted(false);
  };

  // 获取年龄建议
  const getAgeGroup = () => {
    if (!userAge) return null;
    if (userAge <= 28) return '25-28';
    if (userAge <= 32) return '29-32';
    if (userAge <= 35) return '33-35';
    return '36-40';
  };

  const ageGroup = getAgeGroup();
  const ageAdvice = ageGroup ? AGE_ADVICE[ageGroup] : null;

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 渲染消息内容（支持简单的markdown，安全渲染无XSS风险）
  const renderMessageContent = (content: string) => {
    // 按换行拆分，逐行处理
    const lines = content.split('\n');
    return (
      <span>
        {lines.map((line, lineIdx) => {
          // 将 - 开头的行转换为 • 列表项
          const displayLine = line.replace(/^-\s/, '• ');
          // 将 **text** 转换为粗体
          const parts = displayLine.split(/(\*\*.*?\*\*)/g);
          return (
            <span key={lineIdx}>
              {lineIdx > 0 && <br />}
              {parts.map((part, partIdx) => {
                const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
                if (boldMatch) {
                  return <strong key={partIdx}>{boldMatch[1]}</strong>;
                }
                return <span key={partIdx}>{part}</span>;
              })}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {/* 未读消息指示 */}
          {!hasStarted && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral-500 rounded-full animate-pulse" />
          )}
        </div>
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-white text-teal-700 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          有问题？问AI助手
        </span>
      </button>

      {/* 聊天窗口 */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: isOpen ? '600px' : '0' }}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">AI备孕顾问</h3>
                <p className="text-white/70 text-xs">
                  {aiService.isDemoMode() ? '演示模式' : '在线'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetConversation}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="重新开始"
              >
                <RotateCcw className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="关闭聊天窗口"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 消息区域 */}
        <ScrollArea className="flex-1 h-[calc(100%-140px)] p-4">
          <div className="space-y-4">
            {/* 欢迎消息 */}
            {!hasStarted && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      您好！我是您的AI备孕顾问 🤗
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      我可以帮您：
                    </p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• 解释医学术语（如AMH、TORCH等）</li>
                      <li>• 推荐适合您的体检项目</li>
                      <li>• 解答备孕相关问题</li>
                      <li>• 分析检查报告指标</li>
                    </ul>
                    {ageAdvice && (
                      <div className="mt-3 p-2 bg-teal-50 rounded-xl">
                        <p className="text-xs text-teal-600 font-medium mb-1">
                          💡 针对{ageGroup}岁年龄段的建议：
                        </p>
                        <ul className="text-xs text-teal-600 space-y-0.5">
                          {ageAdvice.slice(0, 3).map((advice, i) => (
                            <li key={i}>• {advice}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 ml-1">
                    {formatTime(Date.now())}
                  </span>
                </div>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-coral-100'
                      : 'bg-teal-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-coral-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-teal-600" />
                  )}
                </div>
                <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block text-left rounded-2xl p-3 max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-coral-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                    }`}
                  >
                    <p className={`text-sm leading-relaxed ${
                      msg.role === 'user' ? 'text-white' : 'text-gray-700'
                    }`}>
                      {renderMessageContent(msg.content)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* 加载中 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                    <span className="text-sm text-gray-500">思考中...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 快捷问题 */}
        {showQuickQuestions && (
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              常见问题
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.slice(0, 4).map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }
              }}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
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
    </>
  );
};

export default AIAssistant;
