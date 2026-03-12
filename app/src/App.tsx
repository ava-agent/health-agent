import { useState } from 'react';
import './App.css';
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import PackageSection from './sections/PackageSection';
import HospitalSection from './sections/HospitalSection';
import ChecklistSection from './sections/ChecklistSection';
import PolicySection from './sections/PolicySection';
import GuideSection from './sections/GuideSection';
import CTASection from './sections/CTASection';
import Footer from './sections/Footer';
import { AIContextProvider } from './components/ai/AIContextProvider';

function App() {
  // 全局用户年龄状态
  const [userAge, setUserAge] = useState<number>(29);

  // 处理年龄变化
  const handleAgeChange = (age: number) => {
    setUserAge(age);
  };

  return (
    <AIContextProvider initialAge={userAge}>
      <div className="min-h-screen bg-mint-50 font-sans">
        <Navigation />
        <main>
          <HeroSection onAgeChange={handleAgeChange} />
          <PackageSection userAge={userAge} />
          <HospitalSection />
          <ChecklistSection />
          <PolicySection />
          <GuideSection />
          <CTASection userAge={userAge} />
        </main>
        <Footer userAge={userAge} />

        {/* TODO: AIFloatingBar - 底部悬浮提示栏 */}
        {/* TODO: AIChatPanel - 侧边聊天面板 */}
      </div>
    </AIContextProvider>
  );
}

export default App;
