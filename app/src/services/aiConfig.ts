/**
 * AI服务配置
 *
 * 使用说明：
 * 1. 在.env文件中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
 * 2. AI API Key 在 Supabase Edge Function 服务端配置，不暴露给前端
 * 3. 设置 VITE_DEMO_MODE=false 启用真实AI调用
 *
 * 默认使用演示模式（DEMO_MODE=true），无需后端即可体验
 */

// AI配置接口
export interface AIConfig {
  demoMode: boolean;
}

// 获取环境变量配置
export const getAIConfig = (): AIConfig => {
  return {
    // 演示模式 - 无需后端，使用预设回复
    demoMode: import.meta.env.VITE_DEMO_MODE !== 'false',
  };
};

// 系统提示词 - 定义AI助手的角色和能力
export const SYSTEM_PROMPT = `你是一位专业的备孕健康顾问，擅长用通俗易懂的语言解答备孕体检相关问题。

你的职责：
1. 解释医学术语 - 用普通人能听懂的话解释专业词汇
2. 推荐体检项目 - 根据用户年龄、身体状况给出建议
3. 解答备孕疑问 - 关于体检时间、准备事项、注意事项等
4. 分析检查报告 - 帮助理解各项指标的含义

回答原则：
- 使用温暖、鼓励的语气
- 避免过于专业的术语，必要时解释
- 给出具体、可操作的建议
- 不确定时建议咨询专业医生
- 不涉及诊断和治疗方案

当前服务的是上海地区的备孕人群，可以推荐上海的医院和体检套餐。`;

// 医学术语库 - 用于快速解释
export const MEDICAL_TERMS: Record<string, string> = {
  'AMH': '抗缪勒管激素，评估卵巢储备功能的指标，数值越高说明卵子储备越充足',
  'TORCH': '一组病原体的缩写，包括弓形虫、风疹病毒、巨细胞病毒、单纯疱疹病毒等，感染可能影响胎儿发育',
  'TCT': '液基薄层细胞学检查，宫颈癌筛查的一种方法',
  'HPV': '人乳头瘤病毒，某些高危型别与宫颈癌相关',
  '性激素六项': '包括促卵泡激素(FSH)、黄体生成素(LH)、雌二醇(E2)、孕酮(P)、睾酮(T)、泌乳素(PRL)，评估内分泌功能',
  '甲状腺功能': '检查甲状腺激素水平，甲状腺功能异常可能影响受孕和胎儿智力发育',
  '支原体/衣原体': '性传播病原体，感染可能导致不孕或流产',
  'Rh血型': '除ABO外的另一种血型系统，Rh阴性妈妈怀Rh阳性宝宝可能需要特殊处理',
  '空腹血糖': '空腹状态下的血糖水平，用于筛查糖尿病',
  '肝肾功能': '评估肝脏和肾脏的工作状态',
  '凝血功能': '检查血液凝固能力，异常可能增加流产风险',
  '染色体核型': '检查染色体数目和结构是否正常，用于排查遗传病',
  '免疫抗体': '检查体内是否存在影响怀孕的自身抗体',
  '阴超': '经阴道超声检查，比腹部B超更清晰观察子宫和卵巢',
  '乳腺B超': '用超声波检查乳腺组织，筛查乳腺疾病',
  '白带常规': '检查阴道分泌物，判断是否有炎症或感染',
  '梅毒螺旋体': '梅毒病原体的检测，梅毒可通过母婴传播',
  '乙肝': '乙型肝炎病毒检测，乙肝可通过母婴传播',
  '卵巢储备': '卵巢中剩余卵子的数量和质量，随年龄下降',
  '排卵期': '月经周期中最容易受孕的时期，通常在下次月经前14天左右',
  '叶酸': '维生素B9，孕前补充可预防胎儿神经管畸形',
};

// 年龄段配置
export const AGE_GROUPS = [
  {
    min: 25,
    max: 28,
    name: '25-28岁',
    title: '黄金生育期',
    description: '生育力旺盛，卵巢功能良好',
    focusPoints: ['基础检查即可', '关注营养状况', '建立健康生活方式'],
    recommendedPackage: 'basic',
    amhRange: '2.0-6.8 ng/ml',
  },
  {
    min: 29,
    max: 32,
    name: '29-32岁',
    title: '最佳生育期',
    description: '生育力良好，建议全面检查',
    focusPoints: ['建议AMH检测', '关注甲状腺功能', '口腔检查'],
    recommendedPackage: 'comprehensive',
    amhRange: '1.5-4.0 ng/ml',
  },
  {
    min: 33,
    max: 35,
    name: '33-35岁',
    title: '成熟生育期',
    description: '生育力开始下降，需重点关注',
    focusPoints: ['必做AMH检测', '性激素六项', '卵巢储备评估'],
    recommendedPackage: 'comprehensive',
    amhRange: '1.0-3.0 ng/ml',
  },
  {
    min: 36,
    max: 40,
    name: '36-40岁',
    title: '高龄备孕',
    description: '生育力明显下降，建议高端检查',
    focusPoints: ['全面卵巢功能评估', '染色体检查', '遗传咨询'],
    recommendedPackage: 'premium',
    amhRange: '0.5-2.0 ng/ml',
  },
];

// 获取年龄段配置
export const getAgeGroup = (age: number) => {
  return AGE_GROUPS.find(group => age >= group.min && age <= group.max) || AGE_GROUPS[1];
};

// 预设回复（演示模式使用）
export const DEMO_RESPONSES: Record<string, string> = {
  'default': '您好！我是您的备孕健康顾问。我可以帮您：\n\n1. **解释医学术语** - 如AMH、TORCH、性激素六项等\n2. **推荐体检项目** - 根据您的年龄和情况\n3. **解答备孕疑问** - 检查时间、准备事项等\n4. **分析检查报告** - 帮助理解各项指标\n\n请问有什么可以帮助您的吗？',
  
  'amh': '**AMH（抗缪勒管激素）**是评估卵巢储备功能的重要指标。\n\n📊 **正常参考范围：**\n- 25-28岁：2.0-6.8 ng/ml\n- 29-32岁：1.5-4.0 ng/ml\n- 33-35岁：1.0-3.0 ng/ml\n- 36-40岁：0.5-2.0 ng/ml\n\n💡 **解读：**\n- >2.0：卵巢储备良好\n- 1.0-2.0：卵巢储备下降\n- <1.0：卵巢储备较低，建议尽快备孕\n\n⚠️ AMH低不代表不能怀孕，只是提醒要抓紧时间哦！',
  
  'torch': '**TORCH检查**是一组可能影响胎儿的病原体筛查：\n\n🔬 **包含项目：**\n- **T**oxoplasma（弓形虫）- 猫狗宠物可能携带\n- **O**ther（其他）\n- **R**ubella（风疹病毒）\n- **C**ytomegalovirus（巨细胞病毒）\n- **H**erpes simplex（单纯疱疹病毒）\n\n⚠️ **为什么重要？**\n- 孕期感染可能导致流产、胎儿畸形\n- 建议孕前检查，如有感染先治疗再怀孕\n- 养宠物的准妈妈要特别注意弓形虫',
  
  '性激素': '**性激素六项**评估女性内分泌功能：\n\n📋 **检查项目：**\n1. **FSH**（促卵泡激素）- 刺激卵泡发育\n2. **LH**（黄体生成素）- 促进排卵\n3. **E2**（雌二醇）- 主要雌激素\n4. **P**（孕酮）- 维持妊娠\n5. **T**（睾酮）- 雄激素水平\n6. **PRL**（泌乳素）- 过高会抑制排卵\n\n⏰ **检查时间：**月经第2-4天抽血\n\n💡 通过这六项可以了解卵巢功能、排卵情况和内分泌状态。',
  
  '时间': '**最佳检查时间建议：**\n\n📅 **提前多久检查？**\n建议提前**3-6个月**，留出调理时间\n\n🗓️ **月经周期中什么时候去？**\n- **月经干净后3-7天**最佳\n- 避开月经期和排卵期\n- 性激素六项在月经第2-4天\n\n⏰ **一天中什么时候？**\n- 早上8-10点空腹前往\n- 前一天晚上10点后禁食\n\n🚫 **检查前避免：**\n- 性生活（前3天）\n- 剧烈运动\n- 阴道用药',
  
  '准备': '**检查前准备清单：**\n\n📋 **必带物品：**\n- ✅ 身份证、医保卡\n- ✅ 既往病历和检查报告\n- ✅ 空腹前往（可带食物检查后吃）\n- ✅ 宽松舒适的衣物\n\n🍽️ **饮食注意：**\n- 前3天清淡饮食\n- 前一天晚上10点后禁食\n- 避免油腻、高蛋白、饮酒\n\n💊 **药物注意：**\n- 避免阴道用药\n- 慢性病患者药物可正常服用\n- 提前告知医生正在服用的药物\n\n👕 **着装建议：**\n- 宽松上衣（方便抽血）\n- 方便穿脱的裤子\n- 避免连体衣、连衣裙',
  
  '免费': '**上海免费孕前检查政策：**\n\n✅ **申请条件（满足其一）：**\n- 夫妻一方为上海户籍\n- 双方外地户籍但居住证满6个月\n\n📋 **申请流程：**\n1. 到居住地居委会/街道计生办\n2. 填写《家庭档案》申请表\n3. 提交身份证、结婚证、户口本\n4. 领取《免费孕前检查通知单》\n5. 到指定医院预约检查\n\n💰 **免费项目：**\n血常规、尿常规、肝功能、肾功能、甲状腺功能、TORCH筛查、妇科B超、白带常规、男方精液分析等\n\n💡 **省钱攻略：**先申请免费检查，再自费加做AMH、性激素六项等项目，总花费可控制在2000元以内！',
  
  '叶酸': '**叶酸补充指南：**\n\n💊 **为什么要补？**\n- 预防胎儿神经管畸形\n- 降低流产风险\n- 促进胎儿正常发育\n\n📏 **剂量建议：**\n- 孕前3个月开始：0.4-0.8mg/天\n- 怀孕后前3个月继续\n- 有神经管缺陷史：需4mg/天（遵医嘱）\n\n🥬 **食物来源：**\n- 绿叶蔬菜（菠菜、油菜）\n- 豆类、坚果\n- 动物肝脏\n\n⏰ **服用时间：**\n- 建议早餐后服用\n- 每天固定时间\n- 与维生素C同服吸收更好\n\n💡 单纯食补不够，建议服用叶酸片！',
};

// 根据关键词获取演示回复
export const getDemoResponse = (message: string): string => {
  const lowerMsg = message.toLowerCase();
  
  // 关键词匹配
  if (lowerMsg.includes('amh')) return DEMO_RESPONSES.amh;
  if (lowerMsg.includes('torch')) return DEMO_RESPONSES.torch;
  if (lowerMsg.includes('性激素') || lowerMsg.includes('六项')) return DEMO_RESPONSES.性激素;
  if (lowerMsg.includes('时间') || lowerMsg.includes('什么时候')) return DEMO_RESPONSES['时间'];
  if (lowerMsg.includes('准备') || lowerMsg.includes('注意')) return DEMO_RESPONSES.准备;
  if (lowerMsg.includes('免费') || lowerMsg.includes('政策')) return DEMO_RESPONSES.免费;
  if (lowerMsg.includes('叶酸')) return DEMO_RESPONSES.叶酸;
  
  return DEMO_RESPONSES.default;
};
