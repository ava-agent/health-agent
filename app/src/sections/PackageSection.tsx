import { useState, useRef, useEffect } from 'react';
import { Check, Star, Crown, Sparkles, ChevronRight, HelpCircle, Info } from 'lucide-react';
import { MedicalTerm } from '@/components/MedicalTerm';
import { getAgeGroup } from '@/services/aiConfig';

type IconName = 'sparkles' | 'star' | 'crown';

interface Package {
  id: string;
  name: string;
  price: string;
  priceRange: [number, number];
  description: string;
  features: { text: string; isMedical?: boolean; term?: string }[];
  recommendedFor: string[];
  iconName: IconName;
  color: string;
  bgColor: string;
}

const ICON_MAP: Record<IconName, React.ReactNode> = {
  sparkles: <Sparkles className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
};

const packages: Package[] = [
  {
    id: 'basic',
    name: '基础版',
    price: '¥1,500-2,500',
    priceRange: [1500, 2500],
    description: '覆盖所有必做项目，适合身体健康、无特殊病史的年轻女性',
    recommendedFor: ['25-28岁', '身体健康', '首次备孕'],
    features: [
      { text: '血常规、尿常规、血型' },
      { text: '肝肾功能检查' },
      { text: '妇科检查 + B超' },
      { text: 'TORCH五项筛查', isMedical: true, term: 'TORCH' },
      { text: '甲状腺功能', isMedical: true, term: '甲状腺功能' },
      { text: 'TCT宫颈筛查', isMedical: true, term: 'TCT' },
    ],
    iconName: 'sparkles',
    color: 'from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'comprehensive',
    name: '全面版',
    price: '¥3,500-5,000',
    priceRange: [3500, 5000],
    description: '必做项目 + AMH + 性激素，适合29-35岁备孕女性',
    recommendedFor: ['29-35岁', '推荐选择', '全面评估'],
    features: [
      { text: '包含基础版所有项目' },
      { text: 'AMH卵巢储备检测', isMedical: true, term: 'AMH' },
      { text: '性激素六项', isMedical: true, term: '性激素六项' },
      { text: 'HPV病毒检测', isMedical: true, term: 'HPV' },
      { text: '乳腺B超检查' },
      { text: '口腔健康检查' },
      { text: '甲状腺B超' },
    ],
    iconName: 'star',
    color: 'from-teal-400 to-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'premium',
    name: '高端版',
    price: '¥6,000-8,000',
    priceRange: [6000, 8000],
    description: '全面检查 + 遗传学筛查 + VIP服务，适合高龄或有特殊情况者',
    recommendedFor: ['36岁以上', '高龄备孕', '特殊情况'],
    features: [
      { text: '包含全面版所有项目' },
      { text: '染色体核型分析', isMedical: true, term: '染色体核型' },
      { text: '遗传病基因筛查', isMedical: true, term: '遗传病' },
      { text: '凝血功能检查', isMedical: true, term: '凝血功能' },
      { text: '免疫抗体检查', isMedical: true, term: '免疫抗体' },
      { text: 'VIP绿色通道' },
      { text: '专家一对一咨询' },
    ],
    iconName: 'crown',
    color: 'from-rose-400 to-rose-500',
    bgColor: 'bg-rose-50',
  },
];

interface PackageSectionProps {
  userAge?: number;
}

const PackageSection = ({ userAge = 29 }: PackageSectionProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 根据年龄获取推荐套餐
  const getRecommendedPackage = () => {
    const ageGroup = getAgeGroup(userAge);
    return ageGroup.recommendedPackage;
  };

  const recommendedPackage = getRecommendedPackage();

  return (
    <section
      id="packages"
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
            <span className="tag-primary mb-4 inline-block">套餐选择</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-teal-800 mb-4">
              选择适合您的体检方案
            </h2>
            <p className="text-lg text-teal-600/70 max-w-2xl mx-auto">
              根据您的年龄、身体状况和预算，选择最适合的体检套餐
            </p>
            
            {/* Age-based recommendation */}
            {userAge && (
              <div 
                className={`mt-6 inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-teal-50 to-mint-100 rounded-2xl transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-teal-600">
                    根据您的年龄 <span className="font-bold text-teal-800">{userAge}岁</span>
                  </p>
                  <p className="text-sm font-medium text-teal-800">
                    推荐选择：{recommendedPackage === 'basic' ? '基础版' : recommendedPackage === 'comprehensive' ? '全面版' : '高端版'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Package Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 perspective-1000">
            {packages.map((pkg, index) => {
              const isRecommended = pkg.id === recommendedPackage;
              
              return (
                <div
                  key={pkg.id}
                  className={`relative transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                  onMouseEnter={() => setHoveredId(pkg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-coral-400 to-coral-500 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-current" />
                        适合{userAge}岁
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  <div
                    className={`h-full bg-white rounded-3xl p-6 sm:p-8 transition-all duration-500 preserve-3d ${
                      hoveredId === pkg.id
                        ? 'shadow-2xl scale-[1.02] -translate-y-2'
                        : 'shadow-lg'
                    } ${isRecommended ? 'ring-2 ring-coral-200' : ''}`}
                    style={{
                      transform:
                        hoveredId === pkg.id
                          ? 'perspective(1000px) rotateX(2deg) rotateY(-2deg)'
                          : 'none',
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} text-white flex items-center justify-center shadow-lg`}
                      >
                        {ICON_MAP[pkg.iconName]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-teal-800">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-coral-500">{pkg.price}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-teal-600/70 text-sm mb-4 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Recommended For */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {pkg.recommendedFor.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isRecommended
                              ? 'bg-coral-100 text-coral-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-3 transition-all duration-300 ${
                            hoveredId === pkg.id ? 'translate-x-1' : ''
                          }`}
                          style={{ transitionDelay: `${i * 50}ms` }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isRecommended
                                ? 'bg-coral-100 text-coral-500'
                                : 'bg-teal-100 text-teal-500'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-sm text-teal-700">
                            {feature.isMedical && feature.term ? (
                              <MedicalTerm term={feature.term} showIcon={false}>
                                {feature.text}
                              </MedicalTerm>
                            ) : (
                              feature.text
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      className={`w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group ${
                        isRecommended
                          ? 'bg-gradient-to-r from-coral-400 to-coral-500 text-white hover:shadow-glow-coral'
                          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}
                    >
                      选择此套餐
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Shine Effect */}
                  {hoveredId === pkg.id && (
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
                      style={{
                        background:
                          'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                        animation: 'shine 0.6s ease-out',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison Toggle */}
          <div 
            className={`mt-8 text-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <Info className="w-4 h-4" />
              {showComparison ? '收起对比' : '查看详细对比'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Comparison Table */}
          {showComparison && (
            <div 
              className="mt-8 bg-white rounded-3xl shadow-lg overflow-hidden animate-scale-in"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                      <th className="px-6 py-4 text-left font-medium">检查项目</th>
                      <th className="px-6 py-4 text-center font-medium">基础版</th>
                      <th className="px-6 py-4 text-center font-medium bg-coral-500/20">全面版</th>
                      <th className="px-6 py-4 text-center font-medium">高端版</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: '血常规、尿常规', basic: true, comprehensive: true, premium: true },
                      { name: '肝肾功能', basic: true, comprehensive: true, premium: true },
                      { name: 'TORCH筛查', basic: true, comprehensive: true, premium: true, medical: true },
                      { name: '甲状腺功能', basic: true, comprehensive: true, premium: true, medical: true },
                      { name: '妇科B超', basic: true, comprehensive: true, premium: true },
                      { name: 'TCT宫颈筛查', basic: true, comprehensive: true, premium: true, medical: true },
                      { name: 'AMH检测', basic: false, comprehensive: true, premium: true, medical: true },
                      { name: '性激素六项', basic: false, comprehensive: true, premium: true, medical: true },
                      { name: 'HPV检测', basic: false, comprehensive: true, premium: true, medical: true },
                      { name: '乳腺B超', basic: false, comprehensive: true, premium: true },
                      { name: '口腔检查', basic: false, comprehensive: true, premium: true },
                      { name: '染色体检查', basic: false, comprehensive: false, premium: true, medical: true },
                      { name: '遗传病筛查', basic: false, comprehensive: false, premium: true, medical: true },
                    ].map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-teal-800">
                          {item.medical ? (
                            <MedicalTerm term={item.name} showIcon={true}>
                              {item.name}
                            </MedicalTerm>
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {item.basic && <Check className="w-5 h-5 text-emerald-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center bg-coral-50/30">
                          {item.comprehensive && <Check className="w-5 h-5 text-teal-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {item.premium && <Check className="w-5 h-5 text-rose-500 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Note */}
          <div 
            className={`mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">省钱小贴士</h4>
                <p className="text-sm text-amber-700/80 leading-relaxed">
                  可先申请社区<span className="font-medium">免费孕检</span>，再自费加做
                  <MedicalTerm term="AMH" showIcon={false}>AMH</MedicalTerm>、
                  <MedicalTerm term="性激素六项" showIcon={false}>性激素六项</MedicalTerm>、
                  <MedicalTerm term="HPV" showIcon={false}>HPV</MedicalTerm>等项目，
                  总花费可控制在<span className="font-bold text-amber-800">2000元以内</span>！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

export default PackageSection;
