import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

    let systemPrompt = SYSTEM_PROMPT;
    if (userAge) systemPrompt += `\n\n用户年龄：${userAge}岁。`;
    if (context) systemPrompt += `\n\n用户当前正在浏览：${context}`;

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

    if (!stream) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ content, conversationId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Streaming
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
                /* skip unparseable */
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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
