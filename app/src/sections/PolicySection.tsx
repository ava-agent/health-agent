import { useRef, useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Calendar, 
  ClipboardCheck,
  Info,
  ChevronRight,
  Building2,
  Phone
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  details: string[];
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: '申请条件',
    description: '符合以下条件之一即可申请',
    icon: <CheckCircle2 className="w-6 h-6" />,
    details: [
      '夫妻一方为上海户籍',
      '双方均为外地户籍，但持有上海居住证满6个月以上',
      '每孩次限享一次免费检查',
    ],
  },
  {
    id: 2,
    title: '准备材料',
    description: '申请前请准备好以下材料',
    icon: <FileText className="w-6 h-6" />,
    details: [
      '夫妻双方身份证原件及复印件',
      '结婚证原件及复印件',
      '户口本原件及复印件（或居住证）',
      '近期一寸照片各2张',
    ],
  },
  {
    id: 3,
    title: '申请流程',
    description: '到居住地社区办理申请',
    icon: <MapPin className="w-6 h-6" />,
    details: [
      '前往居住地居委会/街道计生办',
      '填写《家庭档案》申请表',
      '提交相关材料进行审核',
      '领取《免费孕前检查通知单》',
    ],
  },
  {
    id: 4,
    title: '预约检查',
    description: '凭通知单到指定医院预约',
    icon: <Calendar className="w-6 h-6" />,
    details: [
      '拨打指定医院预约电话',
      '或登录医院官网/APP预约',
      '选择"免费孕前检查"项目',
      '夫妻双方空腹一同前往',
    ],
  },
];

const districtMethods = [
  { name: '松江区', method: '"随申办"APP → 松江区旗舰店 → 搜索"免费孕前检查"' },
  { name: '静安区', method: '到街镇计生综合服务站领取检查通知单' },
  { name: '闵行区', method: '居委会领取《家庭档案》→ 预约指定医院' },
  { name: '黄浦区', method: '街道社区事务受理服务中心申请' },
  { name: '其他区', method: '咨询居住地居委会或拨打12320' },
];

const freeItems = [
  '血常规、尿常规、血型、血糖',
  '肝功能、肾功能',
  '甲状腺功能、梅毒筛查',
  '风疹/巨细胞/弓形虫抗体检测',
  '妇科B超、白带常规',
  '男科精液分析（男方）',
];

const PolicySection = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate line progress
          lineTimerRef.current = setTimeout(() => setLineProgress(100), 500);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(lineTimerRef.current);
    };
  }, []);

  return (
    <section
      id="policy"
      ref={sectionRef}
      className="py-20 sm:py-28 w-full relative bg-gradient-to-b from-mint-50 to-white"
    >
      <div className="section-container">
        <div className="section-inner">
          {/* Section Header */}
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="tag-accent mb-4 inline-block">免费政策</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-teal-800 mb-4">
              免费孕前检查政策
            </h2>
            <p className="text-lg text-teal-600/70 max-w-2xl mx-auto">
              上海市政府为符合条件的夫妻提供免费孕前检查服务
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Timeline */}
            <div
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <h3 className="text-xl font-bold text-teal-800 mb-8 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-teal-500" />
                申请流程
              </h3>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
                  <div
                    className="absolute top-0 left-0 w-full bg-gradient-to-b from-teal-400 to-coral-400 transition-all duration-1000 ease-out"
                    style={{ height: `${lineProgress}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`relative pl-16 transition-all duration-500 ${
                        isVisible
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-4'
                      }`}
                      style={{ transitionDelay: `${400 + index * 150}ms` }}
                      onMouseEnter={() => setActiveStep(step.id)}
                      onClick={() => setActiveStep(step.id)}
                    >
                      {/* Node */}
                      <div
                        className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          activeStep === step.id || step.id < activeStep
                            ? 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-lg scale-110'
                            : 'bg-white text-teal-400 border-2 border-teal-200'
                        }`}
                      >
                        {step.icon}
                      </div>

                      {/* Content */}
                      <div
                        className={`bg-white rounded-2xl p-5 shadow-md transition-all duration-300 cursor-pointer ${
                          activeStep === step.id
                            ? 'shadow-xl ring-2 ring-teal-100'
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-teal-800">
                            {step.id}. {step.title}
                          </h4>
                          <ChevronRight
                            className={`w-4 h-4 text-teal-400 transition-transform ${
                              activeStep === step.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                        <p className="text-sm text-teal-600/70 mb-3">
                          {step.description}
                        </p>
                        <ul
                          className={`space-y-2 transition-all duration-300 overflow-hidden ${
                            activeStep === step.id
                              ? 'max-h-40 opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          {step.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-teal-600"
                            >
                              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Info Cards */}
            <div
              className={`space-y-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              {/* Free Items Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" />
                  免费项目包含
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {freeItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-teal-600"
                    >
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-teal-500" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      注意：部分项目（如HPV、AMH）不在免费范围内，需自费加做
                    </p>
                  </div>
                </div>
              </div>

              {/* District Methods */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  各区申请方式
                </h3>
                <div className="space-y-3">
                  {districtMethods.map((district, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors"
                    >
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-lg flex-shrink-0">
                        {district.name}
                      </span>
                      <span className="text-sm text-teal-600">
                        {district.method}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  咨询热线
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">上海市卫健委</span>
                    <span className="font-mono font-bold">021-12320</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">计生服务热线</span>
                    <span className="font-mono font-bold">12356</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/70">
                  如有疑问，可拨打以上电话咨询相关政策和申请流程
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Tip */}
          <div
            className={`mt-12 p-6 bg-gradient-to-r from-coral-50 to-rose-50 rounded-2xl border border-coral-100 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-coral-500 text-white flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-coral-800 mb-2">省钱攻略</h4>
                <p className="text-sm text-coral-600/80 leading-relaxed">
                  建议先申请社区免费孕检，再自费加做AMH（200-300元）、性激素六项（300元左右）、HPV检测（300-400元）等项目，
                  总花费可控制在<span className="font-bold text-coral-700">2000元以内</span>，既全面又经济！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PolicySection;
