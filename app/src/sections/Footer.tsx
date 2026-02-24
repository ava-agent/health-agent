import { Heart, Phone, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: '套餐选择', href: '#packages' },
    { name: '医院推荐', href: '#hospitals' },
    { name: '项目清单', href: '#checklist' },
    { name: '免费政策', href: '#policy' },
    { name: '检查指南', href: '#guide' },
  ];

  const hotlines = [
    { name: '上海市卫健委', number: '021-12320' },
    { name: '计生服务热线', number: '12356' },
    { name: '急救电话', number: '120' },
  ];

  return (
    <footer className="w-full bg-teal-800 text-white">
      <div className="section-container py-16">
        <div className="section-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-coral-400" />
                </div>
                <span className="text-xl font-serif font-bold">上海备孕体检指南</span>
              </div>
              <p className="text-teal-200/80 text-sm leading-relaxed mb-6 max-w-md">
                为29岁备孕女性量身定制的全面体检指南，涵盖医院推荐、项目清单、价格参考和免费政策，
                帮助您科学备孕，守护新生。
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="tel:021-12320"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href="mailto:info@example.com"
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                快速导航
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-teal-200/80 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-teal-400 group-hover:w-2 transition-all" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hotlines */}
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                咨询热线
              </h4>
              <ul className="space-y-3">
                {hotlines.map((hotline) => (
                  <li key={hotline.name}>
                    <a
                      href={`tel:${hotline.number}`}
                      className="text-sm text-teal-200/80 hover:text-white transition-colors"
                    >
                      <div className="font-medium">{hotline.name}</div>
                      <div className="text-lg font-mono font-bold">{hotline.number}</div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-teal-300/60">
                © {currentYear} 上海备孕体检指南. 仅供参考，具体以医院实际为准.
              </p>
              <p className="text-sm text-teal-300/60 flex items-center gap-1">
                用
                <Heart className="w-4 h-4 text-coral-400 fill-coral-400" />
                守护每一个新生命
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
