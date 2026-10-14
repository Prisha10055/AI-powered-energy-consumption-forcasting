import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  Copy, 
  Check, 
  Download, 
  FolderArchive, 
  FileText, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';
import { PROJECT_FILES, ProjectFile } from '../data/projectData';
import { exportProjectAsZip } from '../utils/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleZipDownload = async () => {
    try {
      setIsExporting(true);
      await exportProjectAsZip();
    } finally {
      setIsExporting(false);
    }
  };

  // Group files by directory
  const rootFiles = PROJECT_FILES.filter((f) => !f.path.includes('/'));
  const dataFiles = PROJECT_FILES.filter((f) => f.path.startsWith('data/'));
  const srcFiles = PROJECT_FILES.filter((f) => f.path.startsWith('src/'));
  const notebookFiles = PROJECT_FILES.filter((f) => f.path.startsWith('notebooks/'));

  return (
    <div className="space-y-6">
      {/* Top Banner with Download ZIP CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            Complete Project Source Code & GitHub Files
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            100% production-ready, modular Python scripts, Jupyter notebooks, test datasets, and configuration files.
          </p>
        </div>

        <button
          onClick={handleZipDownload}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <FolderArchive className="w-4 h-4" />
          {isExporting ? 'Generating ZIP Archive...' : 'Download Full Repo (.ZIP)'}
        </button>
      </div>

      {/* Main Code View: Left Tree, Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 font-mono">
              AI-Energy-Forecasting/
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{PROJECT_FILES.length} files</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Root Files */}
            <div className="space-y-1">
              {rootFiles.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left ${
                    selectedFile.path === f.path
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{f.filename}</span>
                </button>
              ))}
            </div>

            {/* data/ folder */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium px-2 py-0.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>data/</span>
              </div>
              <div className="pl-4 space-y-1">
                {dataFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(f)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left ${
                      selectedFile.path === f.path
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.filename}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* src/ folder */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium px-2 py-0.5">
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                <span>src/</span>
              </div>
              <div className="pl-4 space-y-1">
                {srcFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(f)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left ${
                      selectedFile.path === f.path
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.filename}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* notebooks/ folder */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium px-2 py-0.5">
                <Folder className="w-3.5 h-3.5 text-orange-400" />
                <span>notebooks/</span>
              </div>
              <div className="pl-4 space-y-1">
                {notebookFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFile(f)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded transition-colors text-left ${
                      selectedFile.path === f.path
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{f.filename}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Code Content Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-white">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors cursor-pointer"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
            <div className="flex">
              {/* Line Numbers */}
              <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 mr-4 font-mono">
                {selectedFile.content.split('\n').map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Code */}
              <pre className="text-slate-300 flex-1 overflow-x-auto whitespace-pre leading-6">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
