import { type AIConfig, getAIConfig, getDemoResponse } from './aiConfig';
import { supabase, getSessionId } from './supabase';

// 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

// 流式发送选项
export interface SendOptions {
  context?: string;
  action?: 'chat' | 'annotations' | 'report';
  onChunk?: (fullTextSoFar: string) => void;
  userProfileJson?: string;
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

  // 发送消息并获取回复（向后兼容）
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

  // 流式发送消息
  async sendMessageStreaming(message: string, options: SendOptions = {}): Promise<ChatMessage> {
    const { context, action = 'chat', onChunk, userProfileJson } = options;

    // 添加用户消息到本地历史
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    let response: string;

    if (this.config.demoMode) {
      // 演示模式 - 模拟延迟后返回预设回复
      await this.simulateDelay(800);
      response = getDemoResponse(message);
      if (onChunk) {
        onChunk(response);
      }
    } else {
      // 真实模式 - 调用 Edge Function（支持流式）
      response = await this.callEdgeFunctionStreaming(message, { context, action, onChunk, userProfileJson });
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

  // 调用 Supabase Edge Function（流式）
  private async callEdgeFunctionStreaming(
    message: string,
    options: SendOptions = {},
  ): Promise<string> {
    const { context, action = 'chat', onChunk, userProfileJson } = options;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      const errMsg = '未配置Supabase，请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量，或启用演示模式。';
      return errMsg;
    }

    // 构建消息内容 - 如果有用户画像则附加
    let finalMessage = message;
    if (userProfileJson) {
      finalMessage = message + '\n\n用户画像：' + userProfileJson;
    }

    // 非 chat 类型使用 supabase SDK（非流式）
    if (action !== 'chat') {
      if (!supabase) {
        return '未配置Supabase客户端。';
      }
      try {
        const { data, error } = await supabase.functions.invoke('health-chat', {
          body: {
            message: finalMessage,
            conversationId: this.conversationId,
            sessionId: getSessionId(),
            userAge: this.userAge,
            context,
            action,
          },
        });

        if (error) throw error;

        if (data?.conversationId) {
          this.conversationId = data.conversationId;
        }

        return data?.content || '';
      } catch (error) {
        console.error('Edge Function Error:', error);
        return `调用AI服务出错：${error instanceof Error ? error.message : '未知错误'}`;
      }
    }

    // chat 类型使用 fetch + SSE 流式读取
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/health-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalMessage,
          conversationId: this.conversationId,
          sessionId: getSessionId(),
          userAge: this.userAge,
          context,
          action,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      // 检查是否是流式响应
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        // 非流式回退：直接解析 JSON
        const data = await response.json();
        const content = data?.content || '抱歉，我没有理解您的问题。';
        if (onChunk) {
          onChunk(content);
        }
        return content;
      }

      // 流式读取 SSE
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
            const content = parsed.content || '';
            if (content) {
              fullText += content;
              if (onChunk) {
                onChunk(fullText);
              }
            }
          } catch {
            /* skip unparseable SSE lines */
          }
        }
      }

      return fullText || '抱歉，我没有理解您的问题。';
    } catch (error) {
      console.error('Streaming Edge Function Error:', error);
      return `调用AI服务出错：${error instanceof Error ? error.message : '未知错误'}\n\n请检查配置或切换到演示模式。`;
    }
  }

  // 调用 Supabase Edge Function（向后兼容，非流式）
  private async callEdgeFunction(message: string): Promise<string> {
    if (!supabase) {
      return '未配置Supabase，请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量，或启用演示模式。';
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
      return `调用AI服务出错：${error instanceof Error ? error.message : '未知错误'}\n\n请检查配置或切换到演示模式。`;
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
