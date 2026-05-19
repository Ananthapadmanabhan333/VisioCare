"use client";

import React, { useEffect, useState } from 'react';
import { useStore, Ticket } from '@/stores/useStore';
import { 
  ShieldAlert, 
  UserCheck, 
  CheckSquare, 
  Clock, 
  Loader2, 
  CheckCircle,
  FileText, 
  ChevronRight, 
  ListTodo
} from 'lucide-react';

export default function TicketEscalation() {
  const { tickets, activeTicket, fetchTickets, selectTicket, updateTicketStatus, isLoading } = useStore();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelect = async (id: string) => {
    await selectTicket(id);
    setCompletedSteps({}); // Reset steps when switching tickets
  };

  const handleResolve = async () => {
    if (!activeTicket) return;
    await updateTicketStatus(activeTicket.id, "resolved");
    // Reload ticket lists
    await fetchTickets();
  };

  const handleSetInProgress = async () => {
    if (!activeTicket) return;
    await updateTicketStatus(activeTicket.id, "in_progress");
    await fetchTickets();
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-background">
      {/* 1. Left Sidebar: Tickets list */}
      <div className="w-80 border-r border-borderGlow bg-[#0b0e14] flex flex-col h-full">
        <div className="p-4 border-b border-borderGlow flex items-center justify-between">
          <span className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">Escalated Tickets</span>
          <span className="bg-warning/10 text-warning text-[10px] font-mono px-2 py-0.5 rounded border border-warning/20">
            {tickets.filter(t => t.status !== 'resolved').length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tickets.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-mono text-xs">
              No escalated tickets available.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                  activeTicket?.id === t.id
                    ? "bg-gradient-to-r from-warning/10 to-secondary/5 border-warning/30 text-white shadow-redGlow"
                    : "bg-white/[0.01] hover:bg-white/[0.03] border-borderGlow text-gray-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs truncate max-w-[140px] text-white">
                    {t.subject}
                  </span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold ${
                    t.priority === 'critical' || t.priority === 'high'
                      ? "bg-warning/25 text-warning border border-warning/30"
                      : "bg-primary/20 text-primary border border-primary/30"
                  }`}>
                    {t.priority}
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-400 truncate font-sans">
                  {t.description}
                </p>

                <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono pt-1">
                  <span>Status: <strong className={t.status === 'open' ? "text-warning" : t.status === 'resolved' ? "text-success" : "text-primary"}>{t.status}</strong></span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Ticket Panel Detail View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#080b11] cyber-grid">
        {!activeTicket ? (
          <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-warning/5 border border-warning/10 flex items-center justify-center text-warning shadow-redGlow">
              <ShieldAlert className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-lg text-white">Escalation Workspace</h3>
            <p className="text-sm text-gray-400">
              Select an escalated ticket from the sidebar to inspect detailed incident histories, VLM OCR visual reports, and step-by-step resolution tracks.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="glass-card p-6 rounded-2xl border border-warning/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest font-bold bg-warning/20 border border-warning/30 text-warning`}>
                    {activeTicket.priority} PRIORITY
                  </span>
                  <span className="text-gray-500 font-mono text-xs">Incident: {activeTicket.id.substring(0, 8)}</span>
                </div>
                <h2 className="text-xl font-bold text-white font-sans mt-2">{activeTicket.subject}</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-sans">
                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                  <span>Escalated {new Date(activeTicket.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-3">
                {activeTicket.status === 'open' && (
                  <button
                    onClick={handleSetInProgress}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300"
                  >
                    Set Active (In Progress)
                  </button>
                )}
                {activeTicket.status !== 'resolved' ? (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-success text-white hover:opacity-90 shadow-glow transition-all duration-300 flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Resolve Incident</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl text-xs font-bold bg-success/20 border border-success/30 text-success flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span>Incident Resolved</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Layout info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: AI Escalation Report File */}
              <div className="md:col-span-2 space-y-6">
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest border-b border-borderGlow pb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>AI Escalation Report</span>
                  </h3>
                  
                  {/* Predicted Root Cause block */}
                  <div className="p-4 rounded-xl bg-warning/5 border border-warning/15">
                    <span className="text-[10px] font-mono text-warning/80 uppercase tracking-wider block mb-1">Estimated Diagnostic Code</span>
                    <strong className="text-sm font-mono text-white block">{activeTicket.root_cause_prediction}</strong>
                  </div>

                  <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-300 font-mono whitespace-pre-line bg-black/40 border border-borderGlow p-4 rounded-xl max-h-[300px] overflow-y-auto">
                    {activeTicket.ai_escalation_summary}
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Checklist Action Blueprints */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl space-y-4 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest border-b border-borderGlow pb-3 mb-4">
                      <ListTodo className="h-4 w-4 text-secondary" />
                      <span>Resolution Blueprint</span>
                    </h3>

                    <div className="space-y-3.5">
                      {activeTicket.resolution_steps?.map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-borderGlow hover:border-borderGlow/80 transition-all duration-300 group"
                        >
                          <div className={`h-5 w-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            completedSteps[idx] 
                              ? "bg-success border-success text-black" 
                              : "border-gray-600 group-hover:border-primary"
                          }`}>
                            {completedSteps[idx] && <CheckSquare className="h-4.5 w-4.5 stroke-[3]" />}
                          </div>
                          <span className={`text-[11px] leading-relaxed font-sans transition-all duration-300 ${
                            completedSteps[idx] ? "text-gray-500 line-through" : "text-gray-300"
                          }`}>
                            {step}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeTicket.status !== 'resolved' && (
                    <div className="pt-4 border-t border-borderGlow/40">
                      <p className="text-[10px] text-gray-500 text-center font-mono">
                        Finish all blueprint tasks prior to resolving case files.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
