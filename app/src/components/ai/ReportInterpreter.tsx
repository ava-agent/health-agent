import { useState } from 'react';
import { useAIContext } from './AIContextProvider';
import { FlaskConical } from 'lucide-react';

export function ReportInterpreter() {
  const { sendMessage } = useAIContext();
  const [values, setValues] = useState({ amh: '', tsh: '', fsh: '', other: '' });

  const handleSubmit = () => {
    const parts: string[] = [];
    if (values.amh) parts.push(`AMH: ${values.amh} ng/ml`);
    if (values.tsh) parts.push(`TSH: ${values.tsh} mIU/L`);
    if (values.fsh) parts.push(`FSH: ${values.fsh} IU/L`);
    if (values.other) parts.push(`其他: ${values.other}`);
    if (parts.length === 0) return;
    sendMessage(
      `请帮我解读以下检查报告数值：\n${parts.join('\n')}\n\n请告诉我每项指标是否正常，以及下一步建议。`,
    );
  };

  return (
    <div className="bg-teal-50 rounded-xl p-3 space-y-2">
      <h5 className="text-xs font-medium text-teal-800 flex items-center gap-1">
        <FlaskConical className="w-3.5 h-3.5" />
        输入检查报告数值
      </h5>
      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="AMH"
          value={values.amh}
          onChange={(e) => setValues((v) => ({ ...v, amh: e.target.value }))}
          className="px-2 py-1.5 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
        <input
          placeholder="TSH"
          value={values.tsh}
          onChange={(e) => setValues((v) => ({ ...v, tsh: e.target.value }))}
          className="px-2 py-1.5 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
        <input
          placeholder="FSH"
          value={values.fsh}
          onChange={(e) => setValues((v) => ({ ...v, fsh: e.target.value }))}
          className="px-2 py-1.5 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
        />
      </div>
      <input
        placeholder="其他指标（自由输入）"
        value={values.other}
        onChange={(e) => setValues((v) => ({ ...v, other: e.target.value }))}
        className="w-full px-2 py-1.5 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-400"
      />
      <button
        onClick={handleSubmit}
        className="w-full py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
      >
        AI 解读报告
      </button>
    </div>
  );
}
