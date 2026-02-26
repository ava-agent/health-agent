import { useRef, useEffect, useState } from 'react';
import { Heart, ArrowUp, Phone } from 'lucide-react';

interface CTASectionProps {
  userAge?: number;
}

const CTASection = ({ userAge = 29 }: CTASectionProps) => {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-28 w-full relative bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-white" />
        <div className="absolute top-20 right-20 w-60 h-60 rounded-full border-2 border-white" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full border-2 border-white" />
      </div>

      {/* Animated Ripples */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-white/30"
              style={{
                width: '300px',
                height: '300px',
                animation: `ripple-expand ${2 + i * 0.5}s ease-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="section-container relative z-10">
        <div className="section-inner text-center">
          {/* Main Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-8">
              <Heart className="w-4 h-4 animate-heartbeat" />
              <span className="text-sm font-medium">科学备孕 · 守护新生</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              开始规划您的体检方案
            </h2>

            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
              {userAge}岁是备孕的好时机，提前做好准备，
              <br />
              为宝宝的健康打下坚实基础
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={scrollToTop}
                className="group relative bg-white text-teal-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  立即开始规划
                  <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <a
                href="tel:021-12320"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-medium text-white border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                咨询热线：021-12320
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">10+</div>
                <div className="text-sm text-white/70">优质医院</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">30+</div>
                <div className="text-sm text-white/70">检查项目</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">免费</div>
                <div className="text-sm text-white/70">政策申请</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#F8FFFE"
          />
        </svg>
      </div>

      <style>{`
        @keyframes ripple-expand {
          0% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default CTASection;
