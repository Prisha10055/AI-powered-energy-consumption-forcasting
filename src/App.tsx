import React, { useState } from 'react';
import { 
  Zap, 
  FolderArchive, 
  Cpu, 
  FileCode, 
  BarChart3, 
  Server, 
  Briefcase, 
  GitBranch, 
  ListOrdered,
  ArrowRight,
  TrendingDown,
  Layers,
  Leaf
} from 'lucide-react';
import { VirtualSimulator } from './components/VirtualSimulator';
import { ArchitectureView } from './components/ArchitectureView';
import { CodeExplorer } from './components/CodeExplorer';
import { ApiPlayground } from './components/ApiPlayground';
import { ImplementationPhases } from './components/ImplementationPhases';
import { GitHubPlanner } from './components/GitHubPlanner';
import { InterviewPrep } from './components/InterviewPrep';
import { exportProjectAsZip } from './utils/zipExporter';

type ActiveTab = 'simulation' | 'architecture' | 'code' | 'api' | 'phases' | 'github' | 'interview';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulation');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      await exportProjectAsZip();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 
        Top Bar Contract:
        Zone 1: Single text element wordmark
        Zone 2: 4-5 single-line nav links
        Zone 3: 1 primary action
      */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <a 
              href="#overview" 
              onClick={(e) => { e.preventDefault(); setActiveTab('simulation'); }}
              className="text-base font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              EnergyForecasting AI
            </a>
          </div>

          {/* Zone 2: Single-line Navigation Controls */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'simulation'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Virtual Simulator
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Architecture & Tech Stack
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Source Code Repository
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flask REST API
            </button>
            <button
              onClick={() => setActiveTab('phases')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'phases'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              10-Phase Guide
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'github'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7-Day Git Plan
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'interview'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Placement Q&A
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Packaging...' : 'Export Repo (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-4">
              {/* Unboxed Metadata (Zero-Pill discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">Production-Ready Proof of Work</span>
                <span aria-hidden="true">·</span>
                <span>Time-Series Machine Learning</span>
                <span aria-hidden="true">·</span>
                <span>Smart Grids & Climate Tech</span>
                <span aria-hidden="true">·</span>
                <span>Python / Scikit-Learn / Flask</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                AI-Powered Energy Consumption Forecasting System
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                An industry-oriented machine learning project built with datasets, time-series feature engineering, and a neural network (MLP) to predict hourly electricity demand, shave peak grid loads, and reduce peak-tariff costs by up to 22%.
              </p>

              {/* Fast Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('simulation')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                >
                  Launch Grid Simulator
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  View All Python Files
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  Interview Defense
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Image Card */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-800 shadow-xl group">
              <img
                src="/src/assets/images/smart_grid_control_center_1792002796734.jpg"
                alt="Smart Grid Operations Room telemetry and load curves"
                className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-[11px] font-mono font-semibold text-emerald-400">
                  Real-World Grid Operations Use Case
                </span>
                <p className="text-xs text-slate-200 mt-0.5">
                  Automating day-ahead load dispatch prevents peaker-plant activation and blackout cascades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs (Mobile & Quick-Switch) */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
          {[
            { id: 'simulation', label: 'Simulator' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'code', label: 'Source Code' },
            { id: 'api', label: 'Flask API' },
            { id: 'phases', label: '10 Phases' },
            { id: 'github', label: '7-Day Git' },
            { id: 'interview', label: 'Interview Q&A' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Views */}
        {activeTab === 'simulation' && <VirtualSimulator />}
        {activeTab === 'architecture' && <ArchitectureView />}
        {activeTab === 'code' && <CodeExplorer />}
        {activeTab === 'api' && <ApiPlayground />}
        {activeTab === 'phases' && <ImplementationPhases />}
        {activeTab === 'github' && <GitHubPlanner />}
        {activeTab === 'interview' && <InterviewPrep />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AI Energy Forecasting System</span>
            <span>·</span>
            <span>Industry Proof of Work</span>
            <span>·</span>
            <span>MIT License</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-white transition-colors"
            >
              Code Files
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className="hover:text-white transition-colors"
            >
              Git Tracker
            </button>
            <button
              onClick={handleExportZip}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              Download .ZIP
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
