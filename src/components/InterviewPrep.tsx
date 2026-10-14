import React, { useState } from 'react';
import { 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  CheckCircle2, 
  Lightbulb, 
  Award,
  Sparkles
} from 'lucide-react';
import { INTERVIEW_QUESTIONS, InterviewQnA } from '../data/projectData';

export const InterviewPrep: React.FC = () => {
  const [openQId, setOpenQId] = useState<number>(1);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">
            Placement & Internship Technical Interview Masterclass
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Curated questions frequently asked by Data Science, Machine Learning, and Climate Tech hiring panels at top product & service companies.
        </p>
      </div>

      {/* Target Companies Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Target Hiring Companies for Energy & AI Engineers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <span className="text-xs font-semibold text-emerald-400 block mb-2">
              Product-Based & Smart City Platforms
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300">
              {[
                'Google (DeepMind)', 'Microsoft Azure Energy', 'Tesla Energy', 'Siemens Smart Grid',
                'Schneider Electric', 'ABB Grid Automation', 'Honeywell Building Solutions', 'General Electric',
                'Bosch IoT', 'Hitachi Energy', 'NVIDIA Omniverse'
              ].map((co) => (
                <span key={co} className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60">
                  {co}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <span className="text-xs font-semibold text-blue-400 block mb-2">
              Global Consultancies & Utilities
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300">
              {[
                'Tata Power', 'TCS (IoT & Digital Twin)', 'Infosys Energy Practice', 'Wipro Engineering',
                'Accenture Sustainability', 'Capgemini Invent', 'Deloitte Climate Tech', 'National Grid',
                'Enel X', 'E.ON', 'Shell Renewables'
              ].map((co) => (
                <span key={co} className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60">
                  {co}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions & Model Answers */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          High-Probability Technical Questions & Model Responses
        </h4>

        {INTERVIEW_QUESTIONS.map((item) => {
          const isOpen = openQId === item.id;
          return (
            <div
              key={item.id}
              className={`border rounded-xl transition-all ${
                isOpen
                  ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenQId(isOpen ? 0 : item.id)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Q{item.id}.
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {item.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4 text-xs">
                  {/* Elevator Pitch Answer */}
                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/60">
                    <span className="text-[11px] font-semibold text-emerald-400 block uppercase tracking-wider mb-1">
                      Quick Elevator Pitch (30-second answer)
                    </span>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      "{item.shortAnswer}"
                    </p>
                  </div>

                  {/* Deep Technical Answer */}
                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/60">
                    <span className="text-[11px] font-semibold text-blue-400 block uppercase tracking-wider mb-1">
                      Deep Technical Defense (For Senior Interviewers)
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {item.technicalAnswer}
                    </p>
                  </div>

                  {/* Interviewer Tip */}
                  <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block font-semibold mb-0.5">
                        Interviewer Perspective & Tip:
                      </strong>
                      <span className="text-slate-300">{item.interviewerTip}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
