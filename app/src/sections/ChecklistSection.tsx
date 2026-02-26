import { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle, Info, ChevronRight, Stethoscope, FlaskConical, Dna, Sparkles, BookOpen } from 'lucide-react';
import { MedicalTerm } from '@/components/MedicalTerm';
import { MedicalTermsList } from '@/components/MedicalTerm';

interface CheckItem {
  name: string;
  description: string;
  price?: string;
  isMedical?: boolean;
  explanation?: string;
}

interface CheckCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  items: CheckItem[];
}

const categories: CheckCategory[] = [
  {
    id: 'required',
    name: '必做项目',
    icon: <Check className="w-5 h-5" />,
    description: '基础孕前检查，所有备孕女性都应完成',
    color: 'text-teal-700',
    bgColor: 'bg-teal-500',
    items: [
      { name: '血常规', description: '贫血、感染筛查', price: '20-30元' },
      { name: '尿常规', description: '肾脏功能、尿路感染', price: '10-20元' },
      { name: '肝功能（大功能）', description: '乙肝、胆质酸等', price: '70-100元' },
      { name: '肾功能', description: '肌酐、尿素氮', price: '30-50元' },
      { name: '血型（ABO+Rh）', description: '预防新生儿溶血', price: '30-50元', isMedical: true, explanation: 'Rh血型' },
      { name: '空腹血糖', description: '糖尿病筛查', price: '10-20元', isMedical: true, explanation: '空腹血糖' },
      { name: '白带常规', description: '阴道炎症、感染', price: '60元左右', isMedical: true, explanation: '白带常规' },
      { name: 'TCT（宫颈细胞学）', description: '宫颈癌筛查', price: '150-200元', isMedical: true, explanation: 'TCT' },
      { name: 'HPV检测', description: '人乳头瘤病毒', price: '300-400元', isMedical: true, explanation: 'HPV' },
      { name: '妇科B超（阴超）', description: '子宫、卵巢状况', price: '100-150元', isMedical: true, explanation: '阴超' },
      { name: '支原体/衣原体', description: '性传播疾病筛查', price: '150元左右', isMedical: true, explanation: '支原体/衣原体' },
      { name: 'TORCH五项', description: '弓形虫、风疹、巨细胞等', price: '200-400元', isMedical: true, explanation: 'TORCH' },
      { name: '甲状腺功能（TSH）', description: '影响胎儿智力发育', price: '50-100元', isMedical: true, explanation: '甲状腺功能' },
      { name: '梅毒螺旋体', description: '传染病筛查', price: '50-80元', isMedical: true, explanation: '梅毒螺旋体' },
      { name: '乳腺B超', description: '乳腺健康', price: '100-150元', isMedical: true, explanation: '乳腺B超' },
      { name: '甲状腺B超', description: '甲状腺结节等', price: '100-150元' },
      { name: '心电图', description: '心脏功能', price: '20-30元' },
    ],
  },
  {
    id: 'recommended',
    name: '强烈建议',
    icon: <Stethoscope className="w-5 h-5" />,
    description: '29岁及以上备孕女性推荐加做',
    color: 'text-coral-700',
    bgColor: 'bg-coral-500',
    items: [
      { name: 'AMH（抗缪勒管激素）', description: '评估卵巢储备功能', price: '200-300元', isMedical: true, explanation: 'AMH' },
      { name: '性激素六项', description: '评估内分泌、排卵功能', price: '300元左右', isMedical: true, explanation: '性激素六项' },
      { name: '口腔检查', description: '孕期牙病无法治疗，需提前处理', price: '100-300元' },
    ],
  },
  {
    id: 'optional',
    name: '选做项目',
    icon: <Dna className="w-5 h-5" />,
    description: '根据具体情况选择',
    color: 'text-violet-700',
    bgColor: 'bg-violet-500',
    items: [
      { name: '弓形虫IgM/IgG抗体（详细）', description: '有宠物/养猫建议加做', price: '100-200元' },
      { name: '染色体核型分析', description: '有家族遗传病史', price: '500-800元/人', isMedical: true, explanation: '染色体核型' },
      { name: '重金属检测', description: '长期接触有害物质', price: '500-1500元' },
      { name: '凝血功能', description: '既往不良孕产史', price: '300-800元', isMedical: true, explanation: '凝血功能' },
      { name: '免疫抗体检查', description: '既往不良孕产史', price: '300-800元', isMedical: true, explanation: '免疫抗体' },
      { name: '精液常规分析（男方）', description: '男方必做检查', price: '100-200元' },
    ],
  },
];

const ChecklistSection = () => {
  const [activeCategory, setActiveCategory] = useState('required');
  const [isVisible, setIsVisible] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(false);
  const [showTermDictionary, setShowTermDictionary] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const animationTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(animationTimerRef.current);
    };
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return;
    setActiveCategory(categoryId);
    setAnimatingItems(true);
    clearTimeout(animationTimerRef.current);
    animationTimerRef.current = setTimeout(() => setAnimatingItems(false), 500);
  };

  const activeCat = categories.find((c) => c.id === activeCategory)!;

  return (
    <section
      id="checklist"
      ref={sectionRef}
      className="py-20 sm:py-28 w-full relative"
    >
      <div className="section-container">
        <div className="section-inner">
          {/* Section Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="tag-primary mb-4 inline-block">项目清单</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-teal-800 mb-4">
              备孕体检项目清单
            </h2>
            <p className="text-lg text-teal-600/70 max-w-2xl mx-auto">
              科学规划检查项目，确保备孕万无一失
            </p>
            
            {/* Term Dictionary Toggle */}
            <button
              onClick={() => setShowTermDictionary(!showTermDictionary)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {showTermDictionary ? '收起术语词典' : '查看医学术语词典'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showTermDictionary ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Term Dictionary */}
          {showTermDictionary && (
            <div className="mb-8 animate-scale-in">
              <MedicalTermsList />
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div
              className={`lg:w-72 flex-shrink-0 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-8">
                <h3 className="font-bold text-teal-800 mb-4 px-2">项目分类</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left ${
                        activeCategory === cat.id
                          ? `${cat.bgColor} text-white shadow-lg`
                          : 'hover:bg-gray-50 text-teal-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activeCategory === cat.id
                            ? 'bg-white/20'
                            : 'bg-gray-100'
                        }`}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{cat.name}</div>
                        <div
                          className={`text-xs ${
                            activeCategory === cat.id
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}
                        >
                          {cat.items.length}项检查
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          activeCategory === cat.id ? 'translate-x-1' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Summary Card */}
                <div className="mt-4 p-4 bg-mint-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-teal-800">
                      温馨提示
                    </span>
                  </div>
                  <p className="text-xs text-teal-600/80 leading-relaxed">
                    建议提前3-6个月进行检查，留出调理时间。检查前3天避免性生活。
                  </p>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div
              className={`flex-1 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className={`${activeCat.bgColor} p-6 text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      {activeCat.icon}
                    </div>
                    <h3 className="text-xl font-bold">{activeCat.name}</h3>
                  </div>
                  <p className="text-white/80 text-sm">{activeCat.description}</p>
                </div>

                {/* Items List */}
                <div className="p-6">
                  <div className="grid gap-3">
                    {activeCat.items.map((item, index) => (
                      <div
                        key={item.name}
                        className={`flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 ${
                          animatingItems
                            ? 'opacity-0 translate-x-4'
                            : 'opacity-100 translate-x-0'
                        }`}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activeCat.bgColor} text-white`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-medium text-teal-800">
                              {item.isMedical && item.explanation ? (
                                <MedicalTerm term={item.explanation} showIcon={true}>
                                  {item.name}
                                </MedicalTerm>
                              ) : (
                                item.name
                              )}
                            </h4>
                            {item.price && (
                              <span className="text-sm text-coral-500 font-medium whitespace-nowrap">
                                {item.price}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-teal-600/70 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <FlaskConical className="w-4 h-4" />
                      <span>
                        共 <strong>{activeCat.items.length}</strong> 项检查
                      </span>
                    </div>
                    <button className="text-sm text-teal-500 hover:text-teal-600 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      有不理解的？问AI助手
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Age-specific Tips */}
          <div
            className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-teal-800 mb-2">29岁重点关注</h4>
              <p className="text-sm text-teal-600/80 leading-relaxed">
                建议优先做<MedicalTerm term="AMH" showIcon={false}>AMH检测</MedicalTerm>了解卵巢储备，
                29岁正常值一般在1.5-4.0ng/ml
              </p>
            </div>
            <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-coral-800 mb-2">甲状腺功能</h4>
              <p className="text-sm text-coral-600/80 leading-relaxed">
                <MedicalTerm term="甲状腺功能" showIcon={false}>甲减</MedicalTerm>在女性中高发，
                会影响受孕和胎儿发育，务必检查
              </p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500 text-white flex items-center justify-center mb-4">
                <Dna className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-violet-800 mb-2">HPV+TCT联合</h4>
              <p className="text-sm text-violet-600/80 leading-relaxed">
                如有异常需先治疗再备孕，建议<MedicalTerm term="HPV" showIcon={false}>HPV</MedicalTerm>和
                <MedicalTerm term="TCT" showIcon={false}>TCT</MedicalTerm>两项一起做
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChecklistSection;
