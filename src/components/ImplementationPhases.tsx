import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { IMPLEMENTATION_PHASES, PhaseGuide } from '../data/projectData';

export const ImplementationPhases: React.FC = () => {
  const [expandedPhase, setExpandedPhase] = useState<number>(1);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white">
          Complete 10-Phase Industry Implementation Blueprint
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Detailed phase-by-phase execution guide covering practical actions, rationale, deliverables, pitfalls to avoid, and exact verification checks.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {IMPLEMENTATION_PHASES.map((p) => {
          const isOpen = expandedPhase === p.phase;
          return (
            <div
              key={p.phase}
              className={`border rounded-xl transition-all ${
                isOpen
                  ? 'bg-slate-900 border-emerald-500/60 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Button */}
              <button
                onClick={() => setExpandedPhase(isOpen ? 0 : p.phase)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      isOpen
                        ? 'bg-emerald-500 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {String(p.phase).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                    <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.what}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                  {/* What & Why Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/60">
                      <strong className="text-emerald-400 block mb-1 font-semibold uppercase tracking-wider text-[11px]">
                        What to Do in this Phase
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{p.what}</p>
                    </div>

                    <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/60">
                      <strong className="text-blue-400 block mb-1 font-semibold uppercase tracking-wider text-[11px]">
                        Why It is Done (Industry Purpose)
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{p.why}</p>
                    </div>
                  </div>

                  {/* Expected Output */}
                  <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/60 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">
                        Expected Deliverable & Artifact:
                      </strong>
                      <span className="text-slate-300">{p.expectedOutput}</span>
                    </div>
                  </div>

                  {/* Common Mistakes & Pitfalls */}
                  <div className="bg-amber-950/20 p-3.5 rounded-lg border border-amber-900/40 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 block font-semibold mb-0.5">
                        Common Junior Mistake to Avoid:
                      </strong>
                      <span className="text-slate-300">{p.commonMistakes}</span>
                    </div>
                  </div>

                  {/* How to Verify */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Verification Check:</span>
                      <code className="text-emerald-400">{p.verification}</code>
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
