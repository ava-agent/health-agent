interface ReportData {
  recommendedPackage: string;
  packageReason: string;
  mustDoItems: string[];
  focusItems: string[];
  recommendedHospitals: string[];
  budgetEstimate: string;
  timeline: string;
  tips: string[];
}

export function AIReportCard({ data }: { data: ReportData }) {
  const packageNames: Record<string, string> = {
    basic: '基础版',
    comprehensive: '全面版',
    premium: '高端版',
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          您的个性化体检计划
        </h4>
      </div>
      <div className="p-4 space-y-4 text-sm">
        {/* Recommended Package */}
        <div>
          <h5 className="font-medium text-teal-800 mb-1">推荐套餐</h5>
          <p className="text-teal-600">
            {packageNames[data.recommendedPackage] || data.recommendedPackage}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">{data.packageReason}</p>
        </div>
        {/* Must-do items */}
        <div>
          <h5 className="font-medium text-teal-800 mb-1">必做项目</h5>
          <div className="flex flex-wrap gap-1.5">
            {data.mustDoItems.map((item, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {/* Focus items */}
        {data.focusItems.length > 0 && (
          <div>
            <h5 className="font-medium text-amber-700 mb-1">重点关注</h5>
            <div className="flex flex-wrap gap-1.5">
              {data.focusItems.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Hospitals */}
        <div>
          <h5 className="font-medium text-teal-800 mb-1">推荐医院</h5>
          <ul className="text-gray-600 space-y-0.5">
            {data.recommendedHospitals.map((h, i) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>
        </div>
        {/* Budget + Timeline */}
        <div className="flex gap-4">
          <div>
            <h5 className="font-medium text-teal-800 mb-0.5">预算估算</h5>
            <p className="text-coral-600 font-medium">{data.budgetEstimate}</p>
          </div>
          <div>
            <h5 className="font-medium text-teal-800 mb-0.5">时间建议</h5>
            <p className="text-gray-600">{data.timeline}</p>
          </div>
        </div>
        {/* Tips */}
        {data.tips.length > 0 && (
          <div className="bg-teal-50 rounded-xl p-3">
            <h5 className="font-medium text-teal-800 mb-1 text-xs">贴士</h5>
            <ul className="text-xs text-teal-600 space-y-0.5">
              {data.tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
