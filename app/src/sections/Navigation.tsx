import { useState, useEffect } from 'react';
import { Heart, Menu, X } from 'lucide-react';

const navItems = [
  { name: '套餐选择', href: '#packages' },
  { name: '医院推荐', href: '#hospitals' },
  { name: '项目清单', href: '#checklist' },
  { name: '免费政策', href: '#policy' },
  { name: '检查指南', href: '#guide' },
];

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        aria-label="主导航"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="section-container">
          <div className="section-inner flex items-center justify-between">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isScrolled
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/20 text-white backdrop-blur-sm'
                }`}
              >
                <Heart className="w-4 h-4" />
              </div>
              <span
                className={`font-serif font-bold transition-colors ${
                  isScrolled ? 'text-teal-800' : 'text-white'
                }`}
              >
                备孕体检指南
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled
                      ? 'text-teal-600 hover:bg-teal-50 hover:text-teal-700'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => handleNavClick('#packages')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isScrolled
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-white text-teal-600 hover:bg-white/90'
                }`}
              >
                开始规划
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
              className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isScrolled
                  ? 'text-teal-600 hover:bg-teal-50'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          role="presentation"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-teal-700 font-medium hover:bg-teal-50 transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => handleNavClick('#packages')}
                className="w-full py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"
              >
                开始规划体检方案
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
