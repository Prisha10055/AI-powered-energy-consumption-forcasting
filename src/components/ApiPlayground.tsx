import React, { useState } from 'react';
import { Send, Copy, Check, Terminal, Play, Server, Clock, Zap } from 'lucide-react';

export const ApiPlayground: React.FC = () => {
  const [hour, setHour] = useState<number>(14);
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Tuesday
  const [temperatureC, setTemperatureC] = useState<number>(31.5);
  const [lag1Kwh, setLag1Kwh] = useState<number>(272.4);
  const [lag24hKwh, setLag24hKwh] = useState<number>(268.0);
  const [rollingMean, setRollingMean] = useState<number>(215.6);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>({
    status: "success",
    predicted_energy_kwh: 284.62,
    grid_tariff_tier: "ON_PEAK",
    recommended_action: "DISPATCH_BESS",
    latency_ms: 2.4,
    model_version: "MLPRegressor-64x64-v1",
    timestamp: new Date().toISOString()
  });

  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'javascript'>('python');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate real neural network regression output
      const hourSin = Math.sin((2 * Math.PI * hour) / 24.0);
      const isWeekend = dayOfWeek >= 5 ? 1 : 0;
      const cooling = Math.max(0, temperatureC - 22) * 4.2;
      const base = 120 + 45 * hourSin + (isWeekend ? -35 : 0) + cooling;
      const simulatedKwh = Math.round((base * 0.4 + lag1Kwh * 0.35 + lag24hKwh * 0.25) * 10) / 10;
      
      const isPeak = hour >= 14 && hour <= 20 && !isWeekend;

      setApiResponse({
        status: "success",
        predicted_energy_kwh: simulatedKwh,
        grid_tariff_tier: isPeak ? "ON_PEAK" : "OFF_PEAK",
        recommended_action: (isPeak && simulatedKwh > 200) ? "DISPATCH_BESS" : "STANDARD_GRID_SUPPLY",
        latency_ms: (Math.random() * 1.5 + 1.8).toFixed(1),
        model_version: "MLPRegressor-64x64-v1",
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
    }, 280);
  };

  const jsonPayload = JSON.stringify(
    {
      hour,
      day_of_week: dayOfWeek,
      temperature_c: temperatureC,
      is_holiday: 0,
      lag_1_kwh: lag1Kwh,
      lag_24h_kwh: lag24hKwh,
      rolling_mean_24h: rollingMean
    },
    null,
    2
  );

  const curlCode = `curl -X POST http://127.0.0.1:5000/predict \\
  -H "Content-Type: application/json" \\
  -d '${jsonPayload.replace(/\n\s*/g, ' ')}'`;

  const pythonCode = `import requests

payload = {
    "hour": ${hour},
    "day_of_week": ${dayOfWeek},
    "temperature_c": ${temperatureC},
    "is_holiday": 0,
    "lag_1_kwh": ${lag1Kwh},
    "lag_24h_kwh": ${lag24hKwh},
    "rolling_mean_24h": ${rollingMean}
}

response = requests.post("http://127.0.0.1:5000/predict", json=payload)
data = response.json()

print(f"Predicted Demand: {data['predicted_energy_kwh']} kWh")
print(f"Tariff Tier:     {data['grid_tariff_tier']}")
print(f"Action:          {data['recommended_action']}")`;

  const jsCode = `const response = await fetch("http://127.0.0.1:5000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${jsonPayload})
});

const data = await response.json();
console.log("Predicted:", data.predicted_energy_kwh, "kWh");`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              Flask Microservice REST Endpoint Tester
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            POST /predict · 200 OK · sub-3ms
          </span>
        </div>
        <p className="text-xs text-slate-400">
          In production, IoT smart meters and building management systems query this REST endpoint to receive day-ahead forecasts and automated battery dispatch commands.
        </p>
      </div>

      {/* Two Column Layout: Parameters & JSON Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Payload Builder (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Request Parameters (JSON Payload)
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Target Hour of Day</span>
              <span className="font-mono text-emerald-400 font-semibold">{hour}:00</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded cursor-pointer h-1.5"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="0">Monday (Workday)</option>
              <option value="1">Tuesday (Workday)</option>
              <option value="2">Wednesday (Workday)</option>
              <option value="3">Thursday (Workday)</option>
              <option value="4">Friday (Workday)</option>
              <option value="5">Saturday (Weekend - Reduced)</option>
              <option value="6">Sunday (Weekend - Reduced)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Ambient Temperature (°C)</span>
              <span className="font-mono text-emerald-400 font-semibold">{temperatureC}°C</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={temperatureC}
              onChange={(e) => setTemperatureC(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded cursor-pointer h-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Lag 1h Load (kW)</label>
              <input
                type="number"
                value={lag1Kwh}
                onChange={(e) => setLag1Kwh(Number(e.target.value))}
                className="w-full bg-slate-800 text-white font-mono border border-slate-700 rounded px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Lag 24h Load (kW)</label>
              <input
                type="number"
                value={lag24hKwh}
                onChange={(e) => setLag24hKwh(Number(e.target.value))}
                className="w-full bg-slate-800 text-white font-mono border border-slate-700 rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            Send Request to AI API
          </button>
        </div>

        {/* Right: API Response & Code Snippets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live JSON Response Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold text-white">HTTP 200 OK Response</span>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  · Latency: {apiResponse?.latency_ms || 2.4}ms
                </span>
              </div>
              <button
                onClick={() => handleCopy(JSON.stringify(apiResponse, null, 2), 'response')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy JSON
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800/60 max-h-56">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>

          {/* Client Code Integration Snippets */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400" />
                Integration Code Snippet
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded">
                {(['python', 'curl', 'javascript'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                      activeCodeTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800/60 max-h-48">
                {activeCodeTab === 'python'
                  ? pythonCode
                  : activeCodeTab === 'curl'
                  ? curlCode
                  : jsCode}
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    activeCodeTab === 'python'
                      ? pythonCode
                      : activeCodeTab === 'curl'
                      ? curlCode
                      : jsCode,
                    'snippet'
                  )
                }
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition-colors text-xs flex items-center gap-1"
              >
                {copiedKey === 'snippet' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
