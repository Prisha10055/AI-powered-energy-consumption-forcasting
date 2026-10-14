import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { SEVEN_DAY_COMMITS } from '../data/projectData';

export const GitHubPlanner: React.FC = () => {
  const [completedDays, setCompletedDays] = useState<number[]>([1]);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    setCompletedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const progressPct = Math.round((completedDays.length / 7) * 100);

  return (
    <div className="space-y-6">
      {/* Overview & Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              7-Day GitHub Proof-of-Work Timeline & Commit Strategy
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Spreading your commits chronologically over 7 days showcases consistent engineering habits rather than a rushed single-day upload.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
              {completedDays.length} / 7 Days Complete ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Progress track */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* GitHub Repository Setup Commands Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Initial Repository Setup Commands
          </span>
          <button
            onClick={() =>
              handleCopy(
                `git init\ngit add .\ngit commit -m "feat: initialize AI energy forecasting repository"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/AI-Energy-Forecasting.git\ngit push -u origin main`,
                'init_commands'
              )
            }
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copiedIndex === 'init_commands' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy Commands
          </button>
        </div>

        <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800/60">
{`git init
git add .
git commit -m "feat: initialize AI energy forecasting repository"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AI-Energy-Forecasting.git
git push -u origin main`}
        </pre>
      </div>

      {/* 7 Days Cards */}
      <div className="space-y-4">
        {SEVEN_DAY_COMMITS.map((item) => {
          const isDone = completedDays.includes(item.day);
          return (
            <div
              key={item.day}
              className={`border rounded-xl p-5 transition-all ${
                isDone
                  ? 'bg-slate-900/90 border-emerald-500/40'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(item.day)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'border border-slate-700 hover:border-slate-500 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Day {item.day}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.phase}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {item.commits.length} commits scheduled
                </div>
              </div>

              {/* Commits List */}
              <div className="pl-9 space-y-2 pt-2">
                {item.commits.map((c, i) => {
                  const cmd = `git add .\ngit commit -m "${c.message}"`;
                  const copyKey = `commit_${item.day}_${i}`;
                  return (
                    <div
                      key={i}
                      className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <GitCommit className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <code className="text-xs font-mono text-emerald-300 font-medium">
                            {c.message}
                          </code>
                        </div>
                        <p className="text-[11px] text-slate-400 pl-5.5">{c.description}</p>
                      </div>

                      <button
                        onClick={() => handleCopy(cmd, copyKey)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
                        title="Copy git commit command"
                      >
                        {copiedIndex === copyKey ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copy
                      </button>
                    </div>
                  );
                })}

                {/* Proof Artifact Checklist */}
                <div className="mt-3 p-2.5 bg-slate-800/30 rounded border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Proof Artifact for Day {item.day}:</strong> {item.proofItem}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
