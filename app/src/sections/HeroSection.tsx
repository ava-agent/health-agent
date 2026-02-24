import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, Shield, Stethoscope, Sparkles } from 'lucide-react';
import AgeSelector from '@/components/AgeSelector';

interface HeroSectionProps {
  onAgeChange?: (age: number) => void;
}

const HeroSection = ({ onAgeChange }: HeroSectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userAge, setUserAge] = useState(29);
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);

  // Trigger loaded state after mount
  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    // Particle animation
    const canvas = particlesRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }
    
    const particles: Particle[] = [];
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        // Mouse attraction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          particle.vx += dx * 0.0001;
          particle.vy += dy * 0.0001;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(58, 107, 105, ${particle.opacity})`;
        ctx.fill();
      });
      
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(58, 107, 105, ${0.1 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        });
      });
      
      animationIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  const scrollToPackages = () => {
    const packagesSection = document.getElementById('packages');
    if (packagesSection) {
      packagesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAgeChange = (age: number) => {
    setUserAge(age);
    onAgeChange?.(age);
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className={`absolute inset-0 transition-all duration-[1.8s] ease-out ${
          isLoaded ? 'scale-100 blur-0' : 'scale-110 blur-md'
        }`}
      >
        <img
          src="/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-mint-50/30 via-transparent to-mint-50/80" />
      </div>
      
      {/* Particle Canvas */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none z-10"
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className="relative z-20 section-container py-20">
        <div className="section-inner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Main Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div 
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md mb-6 transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <Heart className="w-4 h-4 text-coral-500 animate-heartbeat" />
                <span className="text-sm font-medium text-teal-700">科学备孕 · 守护新生</span>
              </div>
              
              {/* Main Title */}
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-teal-800 mb-4 leading-tight transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                上海备孕<br className="hidden sm:block" />体检指南
              </h1>
              
              {/* Subtitle */}
              <p 
                className={`text-lg sm:text-xl text-teal-600/80 mb-6 max-w-lg mx-auto lg:mx-0 transition-all duration-800 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '500ms' }}
              >
                为备孕女性量身定制的全面体检方案
                <span className="block text-base text-teal-500/70 mt-1">
                  医院 · 项目 · 价格 · AI智能推荐
                </span>
              </p>
              
              {/* Feature Icons */}
              <div 
                className={`flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mb-8 transition-all duration-800 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '600ms' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span className="text-sm text-teal-700 font-medium">专业医院</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <span className="text-sm text-teal-700 font-medium">全面项目</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                  <Sparkles className="w-5 h-5 text-coral-500" />
                  <span className="text-sm text-teal-700 font-medium">AI助手</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div 
                className={`transition-all duration-800 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{ transitionDelay: '700ms' }}
              >
                <button
                  onClick={scrollToPackages}
                  className="group relative btn-accent text-lg px-8 py-4 rounded-2xl overflow-hidden"
                >
                  <span className="relative flex items-center gap-2">
                    开始规划体检方案
                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div 
                className={`mt-8 flex justify-center lg:justify-start gap-8 transition-all duration-800 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '800ms' }}
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-teal-700">10+</div>
                  <div className="text-xs text-teal-500">优质医院</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-teal-700">30+</div>
                  <div className="text-xs text-teal-500">检查项目</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-coral-500">AI</div>
                  <div className="text-xs text-teal-500">智能助手</div>
                </div>
              </div>
            </div>

            {/* Right: Age Selector */}
            <div 
              className={`transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-coral-200 rounded-full opacity-50 blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-200 rounded-full opacity-50 blur-xl" />
                
                {/* Age Selector Card */}
                <AgeSelector 
                  onAgeChange={handleAgeChange}
                  initialAge={userAge}
                />

                {/* AI Assistant Hint */}
                <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-teal-800 text-sm mb-1">
                        AI智能助手已就绪
                      </h4>
                      <p className="text-xs text-teal-600/70 leading-relaxed">
                        有任何疑问？点击右下角的AI助手图标，随时为您解答备孕体检相关问题，解释医学术语。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
