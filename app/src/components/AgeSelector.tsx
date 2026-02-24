import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { AGE_GROUPS, getAgeGroup } from '@/services/aiConfig';

interface AgeSelectorProps {
  onAgeChange?: (age: number) => void;
  initialAge?: number;
}

const AgeSelector = ({ onAgeChange, initialAge = 29 }: AgeSelectorProps) => {
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [isExpanded, setIsExpanded] = useState(false);

  const ageGroup = getAgeGroup(selectedAge);

  useEffect(() => {
    onAgeChange?.(selectedAge);
  }, [selectedAge, onAgeChange]);

  // 年龄范围
  const minAge = 25;
  const maxAge = 40;

  // 获取年龄对应的颜色
  const getAgeColor = (age: number) => {
    if (age <= 28) return 'from-emerald-400 to-emerald-500';
    if (age <= 32) return 'from-teal-400 to-teal-500';
    if (age <= 35) return 'from-amber-400 to-amber-500';
    return 'from-rose-400 to-rose-500';
  };

  // 获取年龄标签
  const getAgeLabel = (age: number) => {
    if (age <= 28) return '黄金期';
    if (age <= 32) return '最佳期';
    if (age <= 35) return '成熟期';
    return '高龄';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* 头部 - 始终显示 */}
      <div 
        className={`bg-gradient-to-r ${getAgeColor(selectedAge)} p-5 cursor-pointer transition-all duration-300`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white">{selectedAge}岁</h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                  {getAgeLabel(selectedAge)}
                </span>
              </div>
              <p className="text-white/80 text-sm">{ageGroup.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAge(Math.max(minAge, selectedAge - 1));
              }}
              disabled={selectedAge <= minAge}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-30 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAge(Math.min(maxAge, selectedAge + 1));
              }}
              disabled={selectedAge >= maxAge}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-30 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 简要描述 */}
        <p className="text-white/90 text-sm mt-3">
          {ageGroup.description}
        </p>
      </div>

      {/* 展开内容 */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5">
          {/* 年龄滑块 */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>25岁</span>
              <span>40岁</span>
            </div>
            <input
              type="range"
              min={minAge}
              max={maxAge}
              value={selectedAge}
              onChange={(e) => setSelectedAge(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between mt-2">
              {AGE_GROUPS.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedAge(group.min)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    selectedAge >= group.min && selectedAge <= group.max
                      ? 'bg-teal-100 text-teal-700 font-medium'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>

          {/* 重点关注 */}
          <div className="mb-5">
            <h4 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              这个年龄段重点关注
            </h4>
            <div className="space-y-2">
              {ageGroup.focusPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-teal-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* AMH参考值 */}
          <div className="p-4 bg-gradient-to-r from-teal-50 to-mint-100 rounded-xl">
            <h4 className="text-sm font-bold text-teal-800 mb-1">
              AMH参考范围
            </h4>
            <p className="text-2xl font-bold text-teal-600">
              {ageGroup.amhRange}
            </p>
            <p className="text-xs text-teal-500 mt-1">
              抗缪勒管激素，评估卵巢储备功能
            </p>
          </div>

          {/* 推荐套餐 */}
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">推荐套餐</span>
            <span className={`text-sm font-bold ${
              ageGroup.recommendedPackage === 'basic' ? 'text-emerald-600' :
              ageGroup.recommendedPackage === 'comprehensive' ? 'text-teal-600' :
              'text-rose-600'
            }`}>
              {ageGroup.recommendedPackage === 'basic' ? '基础版' :
               ageGroup.recommendedPackage === 'comprehensive' ? '全面版' : '高端版'}
            </span>
          </div>
        </div>
      </div>

      {/* 展开提示 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors border-t border-gray-100"
      >
        {isExpanded ? '收起详情' : '查看详情'}
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
};

export default AgeSelector;
