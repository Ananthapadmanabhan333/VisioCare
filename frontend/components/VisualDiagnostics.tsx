"use client";

import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Network, FileText, CheckCircle, Play, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  id?: string;
  client_os?: string;
  client_browser?: string;
  network_latency_ms?: string;
  console_logs?: string;
  diagnostic_code?: string;
  status?: string;
  created_at?: string;
}

export default function VisualDiagnostics() {
  // Mock default metrics representing standard browser details
  const [os, setOs] = useState('Windows 11 Home x64');
  const [browser, setBrowser] = useState('Chrome v124.0.0.0');
  const [ping, setPing] = useState('42ms');
  const [consoleInput, setConsoleInput] = useState(
    "Uncaught Error: Stripe Checkout timeout after 15000ms\n" +
    "  at index.js:142:12\n" +
    "  at async dispatchTransaction (checkout.js:88:5)"
  );
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const triggerDiagnosticRun = async () => {
    setIsRunning(true);
    setResult(null);
    
    // Mimic API delay
    await new Promise((resolve) => setTimeout(resolve, 1400));
    
    try {
      const res = await fetch('/api/v1/diagnostics/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_os: os,
          client_browser: browser,
          network_latency_ms: ping,
          console_logs: consoleInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Device & System Diagnostics
        </h2>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Realtime client diagnostics, system parameters, and console inspections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Diagnostics Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Inspection Parameters</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Client Host OS</label>
                <input
                  type="text"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  className="w-full bg-white/[0.02] border border-borderGlow text-white rounded-xl p-3 text-xs focus:outline-none focus:border-primary/50 transition-all duration-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">User Agent Browser</label>
                <input
                  type="text"
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  className="w-full bg-white/[0.02] border border-borderGlow text-white rounded-xl p-3 text-xs focus:outline-none focus:border-primary/50 transition-all duration-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Ping Network Latency</label>
                <input
                  type="text"
                  value={ping}
                  onChange={(e) => setPing(e.target.value)}
                  className="w-full bg-white/[0.02] border border-borderGlow text-white rounded-xl p-3 text-xs focus:outline-none focus:border-primary/50 transition-all duration-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <FileText className="h-3 w-3 text-primary" />
                <span>Console Log / Stack Trace Dump</span>
              </label>
              <textarea
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                rows={8}
                className="w-full bg-[#03060c] border border-borderGlow text-green-400 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-primary/50 transition-all duration-300 leading-relaxed"
                placeholder="Paste runtime stack traces, HTTP warning logs, or CLI errors here..."
              />
            </div>

            <button
              onClick={triggerDiagnosticRun}
              disabled={isRunning || !consoleInput}
              className="w-full py-3.5 rounded-xl font-bold bg-primary text-black hover:bg-primary-hover shadow-glow disabled:opacity-30 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-mono text-xs uppercase tracking-wider">Evaluating System Registers...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span className="font-mono text-xs uppercase tracking-wider">Execute Auto-Diagnostics</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Results Console */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wide border-b border-borderGlow pb-3 mb-4">
                <Activity className="h-4 w-4 text-secondary" />
                <span>Diagnostic Monitor</span>
              </h3>

              {!result && !isRunning && (
                <div className="text-center py-16 text-gray-500 font-mono text-xs space-y-3">
                  <Network className="h-8 w-8 text-gray-600 stroke-[1.5] mx-auto animate-pulse" />
                  <p>Core diagnostics standby.<br />Fill parameters and trigger diagnostic checks.</p>
                </div>
              )}

              {isRunning && (
                <div className="text-center py-16 text-primary font-mono text-xs space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p>Parsing log headers...<br />Evaluating rule indices...</p>
                </div>
              )}

              {result && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Auto-Analysis Complete</h4>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans">
                        Rules matched trace logs successfully. System generated target diagnostic signature.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between border-b border-borderGlow pb-1.5">
                      <span className="text-gray-500">SESSION ID</span>
                      <span className="text-white font-bold">{result.id?.substring(0, 8)}</span>
                    </div>
                    <div className="flex justify-between border-b border-borderGlow pb-1.5">
                      <span className="text-gray-500">ERROR STACK ID</span>
                      <span className="text-primary font-bold">{result.diagnostic_code}</span>
                    </div>
                    <div className="flex justify-between border-b border-borderGlow pb-1.5">
                      <span className="text-gray-500">MONITOR STATUS</span>
                      <span className="text-success uppercase tracking-wider">{result.status}</span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-gray-500">TIMESTAMP</span>
                      <span className="text-gray-400">{result.created_at ? new Date(result.created_at).toLocaleTimeString() : ''}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-borderGlow space-y-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Recommended Action Profile</span>
                    <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                      {result.diagnostic_code === 'ERR_STRIPE_GATEWAY_TIMEOUT' && 
                        "Timeout in stripe transaction detected. Clock NTP is likely drifted or credentials expired. Check webhook configs."}
                      {result.diagnostic_code === 'ERR_DOCKER_OOM_KILLED' && 
                        "Container memory allocation was exceeded. Up resource limit inside values.yaml and clear heavy caches."}
                      {result.diagnostic_code === 'ERR_NET_IP_COLLISION' && 
                        "Host collision flagged. Run lease flush commands, reset DHCP dynamic margins."}
                      {result.diagnostic_code === 'ERR_SYSTEM_BSOD_CRITICAL' && 
                        "Kernel inaccessible drive code halt. Shift motherboard registers from IDE to AHCI, repair sector registers."}
                      {result.diagnostic_code === 'ERR_GENERIC_RUNTIME_EXCEPTION' && 
                        "General exception. Fetch detailed backend browser logs to find stack lines."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="pt-4 border-t border-borderGlow flex justify-between text-[10px] font-mono text-gray-500">
                <span>Core Node: Local</span>
                <span>System Stack: Python</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
