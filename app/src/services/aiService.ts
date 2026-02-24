import { type AIConfig, getAIConfig, getDemoResponse } from './aiConfig';
import { supabase, getSessionId } from './supabase';

// 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// AI服务类
export class AIService {
  private config: AIConfig;
  private conversationHistory: ChatMessage[] = [];
  private conversationId: string | null = null;
  private userAge: number = 29;

  constructor() {
    this.config = getAIConfig();
  }

  // 设置用户年龄（用于传给 Edge Function）
  setUserAge(age: number): void {
    this.userAge = age;
  }

  // 发送消息并获取回复
  async sendMessage(message: string): Promise<ChatMessage> {
    // 添加用户消息到本地历史（UI展示用）
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    let response: string;

    // 演示模式 - 使用预设回复
    if (this.config.demoMode) {
      await this.simulateDelay(800);
      response = getDemoResponse(message);
    } else {
      // 调用 Supabase Edge Function
      response = await this.callEdgeFunction(message);
    }

    // 添加助手回复到本地历史
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };
    this.conversationHistory.push(assistantMessage);

    // 限制本地历史记录长度（保留最近20条）
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return assistantMessage;
  }

  // 调用 Supabase Edge Function
  private async callEdgeFunction(message: string): Promise<string> {
    if (!supabase) {
      return '⚠️ 未配置Supabase，请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量，或启用演示模式。';
    }

    try {
      const { data, error } = await supabase.functions.invoke('health-chat', {
        body: {
          message,
          conversationId: this.conversationId,
          sessionId: getSessionId(),
          userAge: this.userAge,
        },
      });

      if (error) throw error;

      // 保存服务端返回的 conversationId
      if (data?.conversationId) {
        this.conversationId = data.conversationId;
      }

      return data?.content || '抱歉，我没有理解您的问题。';
    } catch (error) {
      console.error('Edge Function Error:', error);
      return `⚠️ 调用AI服务出错：${error instanceof Error ? error.message : '未知错误'}\n\n请检查配置或切换到演示模式。`;
    }
  }

  // 模拟延迟（演示模式用）
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清空对话历史
  clearHistory(): void {
    this.conversationHistory = [];
    this.conversationId = null;
  }

  // 获取对话历史
  getHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  // 更新配置
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 检查是否在演示模式
  isDemoMode(): boolean {
    return this.config.demoMode;
  }
}

// 创建单例实例
let aiServiceInstance: AIService | null = null;

export const getAIService = (): AIService => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

// 重置AI服务（用于切换配置）
export const resetAIService = (): void => {
  aiServiceInstance = null;
};

// 快速问答函数 - 用于术语解释
export const quickAsk = async (question: string): Promise<string> => {
  const ai = getAIService();
  const response = await ai.sendMessage(question);
  return response.content;
};
