import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Phone, Star, ExternalLink, Building2, Building, Heart } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  level: string;
  type: 'specialist' | 'general' | 'budget';
  address: string;
  phone?: string;
  price: string;
  features: string[];
  rating: number;
  color: string;
}

const hospitals: Hospital[] = [
  {
    id: '1',
    name: '复旦大学附属妇产科医院',
    level: '红房子',
    type: 'specialist',
    address: '黄浦区方斜路419号 / 杨浦区沈阳路128号',
    phone: '021-33189900',
    price: '¥3,000-5,000',
    features: ['全国顶尖妇产专科', '孕前门诊专业', '历史悠久'],
    rating: 4.9,
    color: 'from-rose-400 to-rose-500',
  },
  {
    id: '2',
    name: '国际和平妇幼保健院',
    level: '国妇婴',
    type: 'specialist',
    address: '徐汇区衡山路910号',
    phone: '021-64070434',
    price: '¥4,000-6,000',
    features: ['夫妻双人评估套餐', '孕前营养指导', 'VIP服务'],
    rating: 4.8,
    color: 'from-violet-400 to-violet-500',
  },
  {
    id: '3',
    name: '上海市第一妇婴保健院',
    level: '一妇婴',
    type: 'specialist',
    address: '浦东新区高科西路2699号',
    phone: '021-20261000',
    price: '¥5,000左右',
    features: ['东院设备新', '孕前营养指导门诊', '预约便捷'],
    rating: 4.7,
    color: 'from-pink-400 to-pink-500',
  },
  {
    id: '4',
    name: '仁济医院',
    level: '三甲综合',
    type: 'general',
    address: '浦东新区北园路33号(东院)',
    phone: '021-58752345',
    price: '¥4,500-5,700',
    features: ['"仁育好孕"套餐', '综合实力强', '多院区可选'],
    rating: 4.7,
    color: 'from-teal-400 to-teal-500',
  },
  {
    id: '5',
    name: '瑞金医院',
    level: '三甲综合',
    type: 'general',
    address: '黄浦区瑞金二路197号',
    phone: '021-64370045',
    price: '¥5,000左右',
    features: ['综合实力强', '内分泌检查优势', '设备先进'],
    rating: 4.8,
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: '6',
    name: '曙光医院东院',
    level: '三甲综合',
    type: 'general',
    address: '浦东新区张衡路528号',
    phone: '021-53821650',
    price: '¥2,400左右',
    features: ['中西医结合调理', '性价比高', '备孕套餐实惠'],
    rating: 4.5,
    color: 'from-emerald-400 to-emerald-500',
  },
  {
    id: '7',
    name: '上海市第四人民医院',
    level: '二甲',
    type: 'budget',
    address: '虹口区三门路1279号',
    phone: '021-65591800',
    price: '¥1,500-2,000',
    features: ['备孕套餐性价比高', '基础项目齐全', '预约方便'],
    rating: 4.3,
    color: 'from-amber-400 to-amber-500',
  },
  {
    id: '8',
    name: '各区妇幼保健所',
    level: '区级',
    type: 'budget',
    address: '各区均有',
    price: '¥1,500-2,500',
    features: ['基础项目齐全', '可结合免费政策', '就近检查'],
    rating: 4.2,
    color: 'from-cyan-400 to-cyan-500',
  },
];

const typeFilters = [
  { id: 'all', name: '全部医院', icon: <Building2 className="w-4 h-4" /> },
  { id: 'specialist', name: '专科权威', icon: <Heart className="w-4 h-4" /> },
  { id: 'general', name: '三甲综合', icon: <Building className="w-4 h-4" /> },
  { id: 'budget', name: '经济实惠', icon: <Star className="w-4 h-4" /> },
];

const HospitalSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  const filteredHospitals = useMemo(
    () => activeFilter === 'all'
      ? hospitals
      : hospitals.filter((h) => h.type === activeFilter),
    [activeFilter]
  );

  return (
    <section
      id="hospitals"
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
            <span className="tag-primary mb-4 inline-block">医院推荐</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-teal-800 mb-4">
              上海优质体检医院推荐
            </h2>
            <p className="text-lg text-teal-600/70 max-w-2xl mx-auto">
              从专科权威到经济实惠，为您精选上海优质体检医院
            </p>
          </div>

          {/* Filter Tabs */}
          <div
            className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white text-teal-600 hover:bg-teal-50 shadow-md'
                }`}
              >
                {filter.icon}
                {filter.name}
              </button>
            ))}
          </div>

          {/* Hospital Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className={`transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
                onMouseEnter={() => setHoveredId(hospital.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`h-full bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                    hoveredId === hospital.id
                      ? 'shadow-xl scale-[1.02] -translate-y-1'
                      : 'shadow-md'
                  } ${
                    hoveredId && hoveredId !== hospital.id
                      ? 'opacity-60'
                      : 'opacity-100'
                  }`}
                >
                  {/* Color Header */}
                  <div
                    className={`h-2 bg-gradient-to-r ${hospital.color}`}
                  />

                  <div className="p-5">
                    {/* Title & Rating */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-teal-800 text-lg leading-tight mb-1">
                          {hospital.name}
                        </h3>
                        <span className="text-xs text-teal-500 font-medium">
                          {hospital.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-amber-600">
                          {hospital.rating}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-xl font-bold text-coral-500">
                        {hospital.price}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hospital.features.slice(0, 2).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-teal-50 text-teal-600 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {hospital.features.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full">
                          +{hospital.features.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm text-teal-600/70 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>

                    {/* Phone */}
                    {hospital.phone && (
                      <div className="flex items-center gap-2 text-sm text-teal-600/70 mb-4">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{hospital.phone}</span>
                      </div>
                    )}

                    {/* CTA */}
                    <button className="w-full py-2.5 rounded-xl bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors flex items-center justify-center gap-2 group">
                      查看详情
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div
            className={`mt-12 p-6 bg-gradient-to-r from-teal-50 to-mint-100 rounded-2xl transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-teal-800 mb-2">选择建议</h4>
                <p className="text-sm text-teal-600/80 leading-relaxed">
                  如果预算充足，推荐直接去<span className="font-medium text-teal-700">红房子、国妇婴或一妇婴</span>做全面检查；
                  如果想节省费用，可以先申请<span className="font-medium text-teal-700">社区免费孕检</span>，再自费加做AMH、性激素等项目。
                  建议提前1-2周预约，避开月经期检查。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalSection;
