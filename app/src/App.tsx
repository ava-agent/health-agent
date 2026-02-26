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
import AIAssistant from './components/AIAssistant';

function App() {
  // 全局用户年龄状态
  const [userAge, setUserAge] = useState<number>(29);

  // 处理年龄变化
  const handleAgeChange = (age: number) => {
    setUserAge(age);
  };

  return (
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
      
      {/* AI Assistant - 全局悬浮 */}
      <AIAssistant userAge={userAge} />
    </div>
  );
}

export default App;
