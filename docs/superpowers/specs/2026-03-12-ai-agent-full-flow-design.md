# AI Agent 全流程设计方案

## 概述

将 AI 从独立浮窗升级为贯穿整个用户旅程的智能伴侣。采用**智能浮动条 + 展开面板**的交互形态，AI 始终在场但不打扰，用户想深聊就展开。

**后端**: Supabase Edge Function → 智谱 GLM API（OpenAI 兼容格式）

## 架构

```
页面层 (Sections) → AI Context Engine → GLM API (via Edge Function)
                  ↕                    ↕
         Page Annotations       Streaming Response
```

### 核心模块

| 模块 | 职责 |
|------|------|
| **AI Context Engine** | IntersectionObserver 感知当前浏览章节，维护用户画像（年龄、病史、预算），构建上下文注入 system prompt |
| **Smart Floating Bar** | 底部固定浮动条，根据当前章节自动生成一句话建议 |
| **AI Chat Panel** | 从浮动条展开的完整对话面板（~60vh），替代现有 AIAssistant 浮窗 |
| **Page Annotation System** | AI 问诊结束后在页面内容上做个性化标注（推荐/重点/可选） |
| **Report Generator** | 基于对话+画像生成个性化体检计划报告 |

## 用户旅程

### Step 1: 进入网站
浮动条显示默认欢迎语：`🤖 你好！点击和我聊聊，帮你定制体检方案`

### Step 2: 展开面板 — 智能问诊
AI 引导 3-5 个问题建立用户画像：
- 年龄
- 病史/家族遗传病
- 预算范围
- 特殊关注点

问诊结束后 AI 回复"我已了解你的情况，接下来会在页面中为你标注个性化建议"，同时触发页面标注系统。

### Step 3: 浏览页面 — AI 实时伴随
用户浏览页面时，浮动条根据当前可见章节自动更新建议：
- 套餐选择 → "29岁建议全面版，包含 AMH + 性激素六项，性价比最高"
- 医院推荐 → "红房子是顶尖专科，国妇婴有夫妻双人套餐"
- 项目清单 → "你需要重点关注 AMH 和甲状腺功能"
- 免费政策 → "你符合申请条件，建议先申请免费检查再自费加做"

页面内容中出现个性化标注：`🤖 推荐你做`、`⚡ 重点关注`、`💡 可选`。

### Step 4: 术语即问即答
点击页面中的医学术语 → 浮动条即时展示 AI 快速解释，点击"问更多"可展开面板深聊。

### Step 5: 生成体检计划
AI 面板底部提供「生成我的体检计划」按钮。基于所有对话 + 用户画像，一次 GLM 调用生成结构化报告：
- 推荐套餐及理由
- 必做项目清单
- 推荐医院及预约建议
- 预算估算
- 时间安排建议

### Step 6: 报告解读（可选）
用户输入检查报告数值 → AI 解读正常/异常 + 下一步建议。

## 智能浮动条设计

### 三种状态

**默认提示**（首次进入 / 无上下文时）
```
🤖 你好！点击和我聊聊，帮你定制体检方案        [开始对话]
```

**上下文感知**（根据当前可见章节动态变化）
```
💡 29岁建议选择全面版，包含 AMH + 性激素六项    [详细分析]
```

**术语点击**（用户点击了页面中的医学术语）
```
📖 AMH：抗缪勒管激素，评估卵巢储备，正常值 1.5-4.0  [问更多]
```

### 交互行为
- 浮动条固定在页面底部，始终可见
- 点击浮动条右侧按钮或浮动条本身 → 从底部上滑展开对话面板
- 对话面板高度约 60vh，可通过关闭按钮或下拉收起
- 移动端：对话面板全屏覆盖

## 技术实现

### AI Context Engine
- `IntersectionObserver` 监听各 section（packages/hospitals/checklist/policy/guide）的可见性
- 当前可见章节 ID → 注入到 AI 请求的 system prompt 中
- 用户画像（年龄、病史、预算、关注点）存 React Context + localStorage 持久化
- 每个章节预定义 context prompt 模板，动态填入用户画像数据

### GLM API 集成
- Supabase Edge Function 的 `AI_BASE_URL` 改为智谱 GLM endpoint
- `AI_MODEL` 改为 GLM 模型 ID
- 实现 Streaming 响应（SSE）提升交互体验
- System prompt 分层：基础人设 + 当前章节上下文 + 用户画像

### 页面标注系统
- AI 问诊结束后，调用一次 GLM API 生成标注数据（JSON 格式）
- 标注数据结构：`{ sectionId: string, itemId: string, type: 'recommended' | 'important' | 'optional', reason: string }`
- 通过 React Context (`AIAnnotationContext`) 传递给各 Section 组件
- 各组件根据标注数据渲染对应标签

### Report Generator
- 收集用户画像 + 对话历史 + 标注数据
- 一次 GLM 调用，要求返回结构化 JSON
- 前端渲染为报告卡片组件
- 可选：导出为图片（html2canvas）

## 组件清单

### 新增组件
| 组件 | 位置 | 职责 |
|------|------|------|
| `AIFloatingBar` | `src/components/ai/AIFloatingBar.tsx` | 智能浮动条 |
| `AIChatPanel` | `src/components/ai/AIChatPanel.tsx` | 展开的对话面板 |
| `AIContextProvider` | `src/components/ai/AIContextProvider.tsx` | AI 上下文状态管理 |
| `AIOnboarding` | `src/components/ai/AIOnboarding.tsx` | 问诊引导流程 |
| `AIAnnotation` | `src/components/ai/AIAnnotation.tsx` | 页面标注组件 |
| `AIReportCard` | `src/components/ai/AIReportCard.tsx` | 体检计划报告 |
| `ReportInterpreter` | `src/components/ai/ReportInterpreter.tsx` | 报告解读输入 |

### 修改组件
| 组件 | 改动 |
|------|------|
| `App.tsx` | 包裹 `AIContextProvider`，移除旧 `AIAssistant` |
| `aiService.ts` | 支持 streaming 响应、上下文注入、用户画像管理 |
| `aiConfig.ts` | 新增 section context prompts、标注生成 prompt |
| `PackageSection` | 接收 `AIAnnotationContext`，渲染标注标签 |
| `ChecklistSection` | 接收 `AIAnnotationContext`，渲染标注标签 |
| `HospitalSection` | 接收 `AIAnnotationContext`，渲染标注标签 |
| `MedicalTerm` | 点击时通知浮动条展示 AI 解释 |

### 移除/替代
| 组件 | 原因 |
|------|------|
| `AIAssistant.tsx` | 被 `AIFloatingBar` + `AIChatPanel` 完整替代 |
| Demo 模式关键词匹配 | 被真实 GLM API 替代（可保留为 fallback） |

## Edge Function 改动

`supabase/functions/health-chat/index.ts`:
- 支持 streaming 响应（`text/event-stream`）
- 新增 `generateAnnotations` 端点（返回标注 JSON）
- 新增 `generateReport` 端点（返回体检计划 JSON）
- 环境变量：`AI_BASE_URL` → GLM endpoint, `AI_MODEL` → GLM model ID
