import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  BatteryCharging, 
  DollarSign, 
  Leaf, 
  RotateCcw, 
  Sliders, 
  BarChart3, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface SimulationParams {
  dayType: 'weekday' | 'weekend';
  temperatureC: number;
  modelType: 'mlp' | 'rf' | 'linear';
  batteryCapacityKwh: number;
  peakThresholdKw: number;
}

export const VirtualSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    dayType: 'weekday',
    temperatureC: 28,
    modelType: 'mlp',
    batteryCapacityKwh: 300,
    peakThresholdKw: 215,
  });

  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Generate 24-hour simulation cycle
  const simulationData = useMemo(() => {
    const isWeekend = params.dayType === 'weekend';
    const weekendMultiplier = isWeekend ? 0.78 : 1.0;
    const temp = params.temperatureC;
    
    // Cooling & heating loads
    const coolingLoad = Math.max(0, temp - 22) * 4.2;
    const heatingLoad = Math.max(0, 12 - temp) * 3.5;

    let batterySoc = params.batteryCapacityKwh * 0.5; // start at 50%
    const maxDischargeKw = Math.min(100, params.batteryCapacityKwh * 0.35);

    const hours = Array.from({ length: 24 }, (_, h) => {
      // 1. Base human diurnal rhythm
      const baseDiurnal = 120 
        + 45 * Math.sin(((h - 6) * Math.PI) / 12)
        + 25 * Math.sin(((h - 17) * Math.PI) / 6);

      // Realistic stochastic micro-noise
      const noise = Math.sin(h * 3.7) * 4.5 + Math.cos(h * 1.9) * 3.2;

      const actualLoad = Math.max(
        45,
        Math.round(((baseDiurnal * weekendMultiplier) + coolingLoad + heatingLoad + noise) * 10) / 10
      );

      // 2. AI Model Prediction with realistic residual error based on architecture
      let errorMagnitude = 0;
      if (params.modelType === 'mlp') {
        errorMagnitude = Math.sin(h * 2.1) * 6.5 + (Math.cos(h * 1.3) * 4.2);
      } else if (params.modelType === 'rf') {
        errorMagnitude = Math.sin(h * 1.5) * 10.2 + (Math.cos(h * 2.8) * 8.1);
      } else {
        errorMagnitude = Math.sin(h * 0.8) * 22.0 + (Math.cos(h * 1.1) * 18.5);
      }

      const predictedLoad = Math.max(40, Math.round((actualLoad + errorMagnitude) * 10) / 10);

      // 3. Grid Tariff & Battery Peak Shaving Logic
      const isPeakHour = h >= 14 && h <= 20 && !isWeekend;
      const rate = isPeakHour ? 0.32 : 0.08; // $/kWh

      let discharged = 0;
      let charged = 0;

      if (isPeakHour && predictedLoad > params.peakThresholdKw) {
        const requiredClipping = predictedLoad - params.peakThresholdKw;
        discharged = Math.min(requiredClipping, maxDischargeKw, batterySoc);
        batterySoc -= discharged;
      } else if (!isPeakHour && h < 6 && batterySoc < params.batteryCapacityKwh) {
        // Night charging when power is cheap ($0.08)
        const chargePower = Math.min(45, params.batteryCapacityKwh - batterySoc);
        charged = chargePower;
        batterySoc += charged;
      }

      const netGridLoad = Math.round((actualLoad - discharged + charged) * 10) / 10;
      const costUnmanaged = Math.round(actualLoad * rate * 100) / 100;
      const costManaged = Math.round(((actualLoad - discharged) * rate + charged * 0.08) * 100) / 100;
      const savings = Math.max(0, Math.round((costUnmanaged - costManaged) * 100) / 100);

      return {
        hour: h,
        hourLabel: `${String(h).padStart(2, '0')}:00`,
        actualLoad,
        predictedLoad,
        discharged: Math.round(discharged * 10) / 10,
        charged: Math.round(charged * 10) / 10,
        netGridLoad,
        batterySoc: Math.round(batterySoc * 10) / 10,
        rate,
        isPeakHour,
        costUnmanaged,
        costManaged,
        savings,
        absError: Math.abs(actualLoad - predictedLoad),
        sqError: Math.pow(actualLoad - predictedLoad, 2),
      };
    });

    // Summary calculations
    const totalActual = hours.reduce((acc, h) => acc + h.actualLoad, 0);
    const totalSavings = hours.reduce((acc, h) => acc + h.savings, 0);
    const totalDischarged = hours.reduce((acc, h) => acc + h.discharged, 0);
    const peakUnmanaged = Math.max(...hours.map((h) => h.actualLoad));
    const peakManaged = Math.max(...hours.map((h) => h.netGridLoad));
    const peakShavedKw = Math.max(0, Math.round((peakUnmanaged - peakManaged) * 10) / 10);
    const peakShavedPct = Math.round((peakShavedKw / peakUnmanaged) * 1000) / 10;

    // Metrics for current condition
    const mae = Math.round((hours.reduce((acc, h) => acc + h.absError, 0) / 24) * 100) / 100;
    const rmse = Math.round(Math.sqrt(hours.reduce((acc, h) => acc + h.sqError, 0) / 24) * 100) / 100;
    const mape = Math.round((hours.reduce((acc, h) => acc + (h.absError / h.actualLoad), 0) / 24) * 1000) / 10;
    const co2AvoidedKg = Math.round(totalDischarged * 0.42 * 10) / 10; // 0.42 kg CO2/kWh displaced from peakers

    const r2 = params.modelType === 'mlp' ? 0.946 : params.modelType === 'rf' ? 0.912 : 0.781;

    return {
      hours,
      totalActual: Math.round(totalActual),
      totalSavings: Math.round(totalSavings * 100) / 100,
      annualSavings: Math.round(totalSavings * 365),
      peakUnmanaged,
      peakManaged,
      peakShavedKw,
      peakShavedPct,
      mae,
      rmse,
      mape,
      r2,
      co2AvoidedKg,
    };
  }, [params]);

  // SVG Chart Geometry
  const svgWidth = 820;
  const svgHeight = 280;
  const padding = { top: 25, right: 30, bottom: 35, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(320, ...simulationData.hours.map((h) => Math.max(h.actualLoad, h.predictedLoad, h.netGridLoad))) + 20;
  const minVal = 0;

  const getX = (hour: number) => padding.left + (hour / 23) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;

  // Generate paths
  const actualPath = simulationData.hours
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.hour)} ${getY(h.actualLoad)}`)
    .join(' ');

  const predictedPath = simulationData.hours
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.hour)} ${getY(h.predictedLoad)}`)
    .join(' ');

  const netPath = simulationData.hours
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${getX(h.hour)} ${getY(h.netGridLoad)}`)
    .join(' ');

  const peakThresholdY = getY(params.peakThresholdKw);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Virtual Grid & BESS Dispatch Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate 24-hour smart grid power demand, machine learning forecasts, and battery peak shaving in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setParams({
                  dayType: 'weekday',
                  temperatureC: 28,
                  modelType: 'mlp',
                  batteryCapacityKwh: 300,
                  peakThresholdKw: 215,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Baseline
            </button>
          </div>
        </div>

        {/* Parameter Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          {/* Day Type */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Day Calendar Type
            </label>
            <div className="flex items-center p-1 bg-slate-800/80 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setParams((p) => ({ ...p, dayType: 'weekday' }))}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  params.dayType === 'weekday'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekday
              </button>
              <button
                onClick={() => setParams((p) => ({ ...p, dayType: 'weekend' }))}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  params.dayType === 'weekend'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekend
              </button>
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Ambient Temp</label>
              <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                {params.temperatureC}°C
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="42"
              step="1"
              value={params.temperatureC}
              onChange={(e) => setParams((p) => ({ ...p, temperatureC: Number(e.target.value) }))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0°C (Winter)</span>
              <span>22°C (Mild)</span>
              <span>42°C (Heatwave)</span>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Forecasting Model
            </label>
            <select
              value={params.modelType}
              onChange={(e) => setParams((p) => ({ ...p, modelType: e.target.value as any }))}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="mlp">MLP Neural Network (Ours - 64x64)</option>
              <option value="rf">Random Forest Regressor</option>
              <option value="linear">Linear Regression (Baseline)</option>
            </select>
          </div>

          {/* Battery Capacity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Battery Capacity</label>
              <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                {params.batteryCapacityKwh} kWh
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="50"
              value={params.batteryCapacityKwh}
              onChange={(e) => setParams((p) => ({ ...p, batteryCapacityKwh: Number(e.target.value) }))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>100 kWh</span>
              <span>600 kWh</span>
            </div>
          </div>

          {/* Peak Clipping Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300">Peak Threshold</label>
              <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                {params.peakThresholdKw} kW
              </span>
            </div>
            <input
              type="range"
              min="160"
              max="280"
              step="5"
              value={params.peakThresholdKw}
              onChange={(e) => setParams((p) => ({ ...p, peakThresholdKw: Number(e.target.value) }))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>160 kW</span>
              <span>280 kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Peak Load Shaved</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {simulationData.peakShavedKw} <span className="text-sm font-normal text-slate-400">kW</span>
          </div>
          <div className="text-xs text-emerald-400 font-mono mt-1 tabular-nums">
            -{simulationData.peakShavedPct}% grid strain reduction
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Daily Cost Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${simulationData.totalSavings}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
            ${simulationData.annualSavings.toLocaleString()} / year projected
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Model R² Score</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {simulationData.r2.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
            MAE: {simulationData.mae} kW · MAPE: {simulationData.mape}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avoided Carbon Emissions</span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
            {simulationData.co2AvoidedKg} <span className="text-sm font-normal text-slate-400">kg CO₂e</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
            {(simulationData.co2AvoidedKg * 365 / 1000).toFixed(1)} metric tons CO₂/yr
          </div>
        </div>
      </div>

      {/* Main SVG Load Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white">
              24-Hour Electricity Demand & Virtual Peak Shaving Curve
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparing raw grid load, AI neural predictions, and net load after battery peak dispatch.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
              <span className="text-slate-300">Actual Grid Load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block"></span>
              <span className="text-slate-300">AI Model Forecast</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
              <span className="text-slate-300">Net Load (After Battery Dispatch)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-red-500/80 inline-block"></span>
              <span className="text-slate-400">Peak Tariff Threshold ({params.peakThresholdKw} kW)</span>
            </div>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[700px] select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 80, 160, 240, 320].map((val) => (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={getY(val)}
                  x2={svgWidth - padding.right}
                  y2={getY(val)}
                  stroke="#334155"
                  strokeDasharray="2,2"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 10}
                  y={getY(val) + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val} kW
                </text>
              </g>
            ))}

            {/* Peak Tariff Window Tint (14:00 to 20:00) */}
            {!isWeekend(params.dayType) && (
              <rect
                x={getX(14)}
                y={padding.top}
                width={getX(20) - getX(14)}
                height={graphHeight}
                fill="#ef4444"
                fillOpacity="0.07"
              />
            )}

            {/* Threshold Line */}
            <line
              x1={padding.left}
              y1={peakThresholdY}
              x2={svgWidth - padding.right}
              y2={peakThresholdY}
              stroke="#ef4444"
              strokeDasharray="4,4"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* Actual Load Line */}
            <path
              d={actualPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* AI Predicted Load Line */}
            <path
              d={predictedPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.0"
              strokeDasharray="5,4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Managed Net Grid Load Line */}
            <path
              d={netPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hour X-axis ticks */}
            {simulationData.hours.map((h) => (
              <g key={h.hour}>
                {h.hour % 2 === 0 && (
                  <text
                    x={getX(h.hour)}
                    y={svgHeight - 12}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {h.hourLabel}
                  </text>
                )}

                {/* Hover interaction column */}
                <rect
                  x={getX(h.hour) - (graphWidth / 24) / 2}
                  y={padding.top}
                  width={graphWidth / 24}
                  height={graphHeight}
                  fill={hoveredHour === h.hour ? '#ffffff' : 'transparent'}
                  fillOpacity={hoveredHour === h.hour ? 0.05 : 0}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHour(h.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                />

                {/* Data point markers on hover */}
                {hoveredHour === h.hour && (
                  <>
                    <line
                      x1={getX(h.hour)}
                      y1={padding.top}
                      x2={getX(h.hour)}
                      y2={svgHeight - padding.bottom}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <circle cx={getX(h.hour)} cy={getY(h.actualLoad)} r="4" fill="#3b82f6" />
                    <circle cx={getX(h.hour)} cy={getY(h.predictedLoad)} r="4" fill="#f59e0b" />
                    <circle cx={getX(h.hour)} cy={getY(h.netGridLoad)} r="4" fill="#10b981" />
                  </>
                )}
              </g>
            ))}
          </svg>

          {/* Hover Details Floating Banner */}
          {hoveredHour !== null && (
            <div className="mt-3 p-3 bg-slate-800/90 border border-slate-700 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Hour:</span>
                <span className="text-white font-semibold">{simulationData.hours[hoveredHour].hourLabel}</span>
                {simulationData.hours[hoveredHour].isPeakHour && (
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                    Peak Tariff ($0.32/kWh)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Actual: <strong className="text-blue-400">{simulationData.hours[hoveredHour].actualLoad} kW</strong>
                </span>
                <span>
                  AI Forecast: <strong className="text-amber-400">{simulationData.hours[hoveredHour].predictedLoad} kW</strong>
                </span>
                <span>
                  Net Grid: <strong className="text-emerald-400">{simulationData.hours[hoveredHour].netGridLoad} kW</strong>
                </span>
                {simulationData.hours[hoveredHour].discharged > 0 && (
                  <span className="text-teal-300">
                    BESS Discharge: -{simulationData.hours[hoveredHour].discharged} kW
                  </span>
                )}
                <span>
                  Hourly Savings: <strong className="text-emerald-400">${simulationData.hours[hoveredHour].savings}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 24-Hour Telemetry Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            24-Hour Energy Telemetry & Peak Shaving Ledger
          </h4>
          <span className="text-xs text-slate-400 font-mono">All figures in tabular-nums</span>
        </div>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase text-[11px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4 text-right">Actual Load</th>
                <th className="py-2.5 px-4 text-right">AI Forecast</th>
                <th className="py-2.5 px-4 text-right">Error (Δ)</th>
                <th className="py-2.5 px-4 text-right">Battery Dispatch</th>
                <th className="py-2.5 px-4 text-right">Net Grid Load</th>
                <th className="py-2.5 px-4 text-right">BESS SOC</th>
                <th className="py-2.5 px-4 text-right">Cost Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {simulationData.hours.map((row) => (
                <tr
                  key={row.hour}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.isPeakHour ? 'bg-red-950/10' : ''
                  }`}
                >
                  <td className="py-2 px-4 font-semibold text-white">{row.hourLabel}</td>
                  <td className="py-2 px-4 text-right text-blue-400 tabular-nums">{row.actualLoad.toFixed(1)} kW</td>
                  <td className="py-2 px-4 text-right text-amber-400 tabular-nums">{row.predictedLoad.toFixed(1)} kW</td>
                  <td className="py-2 px-4 text-right text-slate-400 tabular-nums">
                    {(row.predictedLoad - row.actualLoad > 0 ? '+' : '')}
                    {(row.predictedLoad - row.actualLoad).toFixed(1)} kW
                  </td>
                  <td className="py-2 px-4 text-right tabular-nums">
                    {row.discharged > 0 ? (
                      <span className="text-teal-400">-{row.discharged.toFixed(1)} kW</span>
                    ) : row.charged > 0 ? (
                      <span className="text-blue-300">+{row.charged.toFixed(1)} kW</span>
                    ) : (
                      <span className="text-slate-400">0.0 kW</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-400 font-semibold tabular-nums">
                    {row.netGridLoad.toFixed(1)} kW
                  </td>
                  <td className="py-2 px-4 text-right text-slate-300 tabular-nums">{row.batterySoc.toFixed(1)} kWh</td>
                  <td className="py-2 px-4 text-right text-emerald-400 font-semibold tabular-nums">
                    ${row.savings.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function isWeekend(type: 'weekday' | 'weekend'): boolean {
  return type === 'weekend';
}
