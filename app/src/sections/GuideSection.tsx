import { useRef, useEffect, useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Utensils, 
  Moon, 
  Pill, 
  Shirt, 
  Heart,
  AlertTriangle,
  CheckCircle2,
  Info,
  User,
  Users
} from 'lucide-react';

interface GuideCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

const guideCards: GuideCard[] = [
  {
    id: 'time',
    title: '最佳检查时间',
    icon: <Clock className="w-6 h-6" />,
    color: 'from-teal-400 to-teal-500',
    items: [
      {
        icon: <Calendar className="w-5 h-5" />,
        title: '提前3-6个月',
        description: '建议提前3-6个月进行检查，留出充足时间调理身体',
      },
      {
        icon: <Moon className="w-5 h-5" />,
        title: '月经干净后3-7天',
        description: '选择月经干净后3-7天，避开排卵期和月经期',
      },
      {
        icon: <Heart className="w-5 h-5" />,
        title: '检查前3天',
        description: '检查前3天避免性生活，以免影响检查结果',
      },
    ],
  },
  {
    id: 'prepare',
    title: '检查前准备',
    icon: <Utensils className="w-6 h-6" />,
    color: 'from-coral-400 to-coral-500',
    items: [
      {
        icon: <Moon className="w-5 h-5" />,
        title: '空腹要求',
        description: '检查前一天晚上10点后禁食，可少量饮水',
      },
      {
        icon: <Utensils className="w-5 h-5" />,
        title: '清淡饮食',
        description: '前3天清淡饮食，避免油腻、高蛋白、饮酒',
      },
      {
        icon: <Pill className="w-5 h-5" />,
        title: '药物注意',
        description: '避免阴道用药，慢性病患者药物可正常服用',
      },
      {
        icon: <Shirt className="w-5 h-5" />,
        title: '着装建议',
        description: '穿宽松衣物，方便检查，避免连体衣',
      },
    ],
  },
  {
    id: 'tips',
    title: '特别提醒',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'from-amber-400 to-amber-500',
    items: [
      {
        icon: <Users className="w-5 h-5" />,
        title: '夫妻双方同查',
        description: '不孕因素中男女各占40%，双方同查更高效',
      },
      {
        icon: <Info className="w-5 h-5" />,
        title: '口腔检查很重要',
        description: '孕期不能拍片、不能麻醉，牙病务必提前处理',
      },
      {
        icon: <Pill className="w-5 h-5" />,
        title: '开始补充叶酸',
        description: '建议孕前3个月开始每天补充0.4-0.8mg叶酸',
      },
      {
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: '建立健康档案',
        description: '保留好所有检查报告，怀孕后产检需要参考',
      },
    ],
  },
];

const ageTips = [
  {
    title: 'AMH检测',
    description: '了解卵巢储备情况，29岁正常值一般在1.5-4.0ng/ml',
    icon: <User className="w-5 h-5" />,
  },
  {
    title: '甲状腺功能',
    description: '甲减在女性中高发，会影响受孕和胎儿发育',
    icon: <Heart className="w-5 h-5" />,
  },
  {
    title: 'HPV+TCT联合',
    description: '如有异常需先治疗再备孕，建议两项一起做',
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  {
    title: '男方同步检查',
    description: '精液质量是备孕成功的关键因素之一',
    icon: <Users className="w-5 h-5" />,
  },
];

const GuideSection = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="guide"
      ref={sectionRef}
      className="py-20 sm:py-28 w-full relative"
    >
      <div className="section-container">
        <div className="section-inner">
          {/* Section Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="tag-primary mb-4 inline-block">检查指南</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-teal-800 mb-4">
              体检时间与注意事项
            </h2>
            <p className="text-lg text-teal-600/70 max-w-2xl mx-auto">
              掌握正确的检查时间和准备事项，让体检更顺利
            </p>
          </div>

          {/* Guide Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {guideCards.map((card, index) => (
              <div
                key={card.id}
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                onMouseEnter={() => setActiveCard(card.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                <div
                  className={`h-full bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 ${
                    activeCard === card.id
                      ? 'shadow-2xl scale-[1.02] -translate-y-2'
                      : ''
                  }`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <h3 className="text-xl font-bold">{card.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {card.items.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-all duration-300 ${
                            activeCard === card.id ? 'translate-x-1' : ''
                          }`}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center flex-shrink-0`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-teal-800 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-teal-600/70">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Age-specific Tips */}
          <div
            className={`bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-500 text-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-violet-800">
                  针对29岁的特别建议
                </h3>
                <p className="text-sm text-violet-600/70">
                  29岁处于生育力较好的阶段，重点关注以下项目
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ageTips.map((tip, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                    {tip.icon}
                  </div>
                  <h4 className="font-medium text-violet-800 mb-2">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-violet-600/70 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Summary */}
          <div
            className={`mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="bg-teal-50 rounded-2xl p-6">
              <h4 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                必带物品清单
              </h4>
              <ul className="space-y-2">
                {[
                  '身份证、医保卡',
                  '既往病历和检查报告',
                  '空腹前往（可带少量食物检查后食用）',
                  '宽松舒适的衣物',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-teal-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-coral-50 rounded-2xl p-6">
              <h4 className="font-bold text-coral-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral-500" />
                检查禁忌
              </h4>
              <ul className="space-y-2">
                {[
                  '月经期不宜做妇科检查',
                  '检查前3天避免性生活',
                  '检查前避免阴道用药',
                  '避免剧烈运动和情绪激动',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-coral-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-coral-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
