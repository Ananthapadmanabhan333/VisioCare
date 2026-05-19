import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import ScreenshotViewer from './ScreenshotViewer';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  ShieldAlert, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  CornerDownRight
} from 'lucide-react';

export default function ChatWorkspace() {
  const { 
    conversations, 
    activeConversation, 
    activeMessages, 
    createConversation, 
    selectConversation, 
    sendMessage, 
    escalateTicket,
    isLoading 
  } = useStore();

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});
  
  // Escalation form modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateSubject, setEscalateSubject] = useState('');
  const [escalateDesc, setEscalateDesc] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Load initial conversations list on component mount
  useEffect(() => {
    useStore.getState().fetchConversations();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let convoId = activeConversation?.id;
    if (!convoId) {
      const newConvo = await createConversation();
      convoId = newConvo.id;
    }

    const currentText = input;
    const currentFile = selectedFile || undefined;
    
    setInput('');
    handleRemoveFile();

    await sendMessage(convoId, currentText, currentFile);
  };

  const handleTriggerEscalate = () => {
    if (!activeConversation) return;
    setEscalateSubject(`Escalated Support Session: ${activeConversation.title}`);
    setEscalateDesc(`Automated escalation for session ${activeConversation.id}. The customer is reporting recurrent issues and requested technical support intervention.`);
    setShowEscalateModal(true);
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;
    await escalateTicket(activeConversation.id, escalateSubject, escalateDesc, "high");
    setShowEscalateModal(false);
  };

  const toggleReasoning = (msgId: string) => {
    setShowReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-background">
      {/* 1. Conversations Sidebar list */}
      <div className="w-80 border-r border-borderGlow bg-[#0b0e14] flex flex-col h-full">
        <div className="p-4 border-b border-borderGlow flex justify-between items-center">
          <span className="text-xs font-bold font-mono tracking-wider text-gray-400 uppercase">Support Sessions</span>
          <button 
            onClick={() => createConversation()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300"
          >
            + New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                activeConversation?.id === conv.id
                  ? "bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/30 text-white"
                  : "bg-white/[0.01] hover:bg-white/[0.03] border-borderGlow text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-xs truncate max-w-[140px] text-white">
                  {conv.title}
                </span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-bold ${
                  conv.status === 'escalated'
                    ? "bg-warning/20 border border-warning/30 text-warning"
                    : conv.status === 'resolved'
                    ? "bg-success/20 border border-success/30 text-success"
                    : "bg-primary/20 border border-primary/30 text-primary"
                }`}>
                  {conv.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Priority: <strong className={conv.priority === 'critical' || conv.priority === 'high' ? "text-warning" : "text-gray-400"}>{conv.priority}</strong></span>
                <span>{new Date(conv.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Chat Thread Area */}
      <div className="flex-1 flex flex-col justify-between h-full bg-[#080b11]">
        {/* Workspace Active Header */}
        <div className="px-6 py-4 border-b border-borderGlow bg-[#0c101b] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-white font-sans truncate max-w-[300px]">
                {activeConversation ? activeConversation.title : "Active Diagnostic Session"}
              </h2>
              {activeConversation && (
                <span className="text-[10px] text-gray-500 font-mono tracking-tight bg-white/[0.05] border border-borderGlow px-2 py-0.5 rounded">
                  ID: {activeConversation.id.substring(0, 8)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              Multimodal VLM active & analyzing logs.
            </p>
          </div>
          {activeConversation && activeConversation.status !== 'escalated' && (
            <button
              onClick={handleTriggerEscalate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 shadow-redGlow transition-all duration-300 flex items-center gap-2"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Escalate Case</span>
            </button>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 cyber-grid">
          {activeMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow">
                <BrainCircuit className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-semibold text-lg text-white">Multimodal Diagnostic Core</h3>
              <p className="text-sm text-gray-400">
                Upload a screenshot, system error screen, CLI code, or describe your diagnostic difficulty. The VLM automatically parses visual layouts, highlights error zones, and outputs interactive solution maps.
              </p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              const isAI = msg.sender_type === 'assistant';
              
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-4xl ${isUser ? "ml-auto items-end" : "mr-auto items-start"} w-full`}
                >
                  <div className={`flex items-center gap-2 mb-1.5 text-xs text-gray-500 font-mono ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <span>{isUser ? "sarah_connor" : "vlm_diagnostics_assistant"}</span>
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>

                  <div className={`p-5 rounded-2xl border transition-all duration-300 w-full ${
                    isUser
                      ? "bg-[#161a29]/90 border-borderGlow text-gray-100 max-w-xl"
                      : "glass-card text-gray-200"
                  }`}>
                    {/* If user uploaded screenshot in message */}
                    {isUser && msg.screenshot_url && (
                      <div className="mb-4 rounded-xl overflow-hidden max-w-sm border border-borderGlow shadow-lg">
                        <img 
                          src={msg.screenshot_url.startsWith("http") || msg.screenshot_url.startsWith("/") ? msg.screenshot_url : `http://127.0.0.1:8000${msg.screenshot_url}`}
                          alt="Customer Screenshot" 
                          className="w-full h-auto object-cover max-h-[220px]" 
                        />
                      </div>
                    )}

                    {/* Standard Text Content */}
                    <div className="text-sm leading-relaxed whitespace-pre-line font-sans prose prose-invert max-w-none">
                      {msg.content}
                    </div>

                    {/* If AI analyzed screenshot, display interactive ScreenshotViewer */}
                    {isAI && msg.diagnostic_payload && msg.diagnostic_payload.error_code && activeMessages.find(m => m.sender_type === 'user' && m.screenshot_url) && (
                      <div className="mt-5 space-y-4">
                        <div className="border-t border-borderGlow pt-4">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-3">VLM Annotated Diagnostic Interface</span>
                          {/* Fetch screenshot url from last user message */}
                          {(() => {
                            const lastUserImg = [...activeMessages]
                              .reverse()
                              .find(m => m.sender_type === 'user' && m.screenshot_url);
                            if (lastUserImg && lastUserImg.screenshot_url) {
                              return (
                                <ScreenshotViewer 
                                  imageUrl={lastUserImg.screenshot_url} 
                                  boxes={msg.diagnostic_payload.bounding_boxes}
                                />
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* AI Agent Reasoning Trace Toggler */}
                    {isAI && msg.reasoning_trace && (
                      <div className="mt-4 border-t border-borderGlow/40 pt-3">
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="text-[10px] font-mono text-secondary hover:text-secondary-hover flex items-center gap-1.5 transition-colors duration-200"
                        >
                          <BrainCircuit className="h-3.5 w-3.5" />
                          <span>{showReasoning[msg.id] ? "Collapse Cognitive Reasoning Trail" : "View Cognitive Reasoning Trail"}</span>
                        </button>
                        
                        {showReasoning[msg.id] && (
                          <div className="mt-2.5 p-3.5 rounded-xl bg-black/60 border border-secondary/20 font-mono text-[11px] leading-relaxed text-purple-300 shadow-purpleGlow">
                            <div className="flex items-center gap-2 text-secondary font-bold text-[10px] tracking-widest uppercase mb-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-secondary shadow-purpleGlow animate-ping" />
                              <span>AI Reasoning Engine Trace</span>
                            </div>
                            <p className="whitespace-pre-line text-purple-300/90">{msg.reasoning_trace}</p>
                            
                            {msg.diagnostic_payload && (
                              <div className="mt-3 pt-3 border-t border-secondary/10 flex flex-wrap gap-4 text-[10px] text-gray-500">
                                <span>Inference Model: <strong className="text-secondary">{msg.diagnostic_payload.inference_mode}</strong></span>
                                <span>Latency: <strong className="text-secondary">{msg.diagnostic_payload.latency_ms}ms</strong></span>
                                <span>Tone Adjust: <strong className="text-secondary">Highly Empathetic</strong></span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {isLoading && (
            <div className="flex items-center gap-3 p-4 glass-card border border-primary/20 max-w-sm rounded-xl text-primary font-mono text-xs shadow-glow">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>VLM orchestrating neural analysis...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Compositing Input Panel */}
        <form onSubmit={handleSend} className="p-4 border-t border-borderGlow bg-[#0c101b] flex flex-col gap-3">
          {/* Selected image preview panel */}
          {filePreview && (
            <div className="flex items-center gap-3 bg-white/[0.02] border border-borderGlow p-2 rounded-xl max-w-md relative">
              <img src={filePreview} alt="Preview" className="h-14 w-20 object-cover rounded-lg border border-borderGlow" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{selectedFile?.name}</p>
                <p className="text-[10px] text-gray-500 font-mono">Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB</p>
              </div>
              <button 
                type="button"
                onClick={handleRemoveFile}
                className="h-6 w-6 rounded-full bg-black/60 border border-borderGlow text-gray-400 hover:text-white flex items-center justify-center absolute -top-2 -right-2 transition-all duration-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-borderGlow text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "Screenshot attached! Describe the system error..." : "Ask a question, upload a warning screenshot, or describe issues..."}
              className="flex-1 bg-white/[0.02] border border-borderGlow focus:border-primary/50 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-all duration-300 font-sans"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isLoading}
              className="p-3.5 rounded-xl bg-primary text-black hover:bg-primary-hover font-bold shadow-glow disabled:opacity-30 disabled:shadow-none transition-all duration-300 flex items-center justify-center"
            >
              <Send className="h-5 w-5 fill-current stroke-[2]" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Dynamic Escalation Ticket Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEscalateSubmit}
            className="w-full max-w-lg glass-card p-6 rounded-2xl space-y-4 border border-warning/20 shadow-redGlow"
          >
            <div className="flex justify-between items-center border-b border-borderGlow pb-3">
              <div className="flex items-center gap-2.5 text-warning font-bold font-sans">
                <ShieldAlert className="h-5 w-5" />
                <span>Automated Case Escalation</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEscalateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              This action triggers the **AI Ticket Intelligence System**, converting this conversation, visual ocr scans, and emotional analysis history into a detailed diagnostic manual for tier-2 technical support agents.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Ticket Subject</label>
              <input
                type="text"
                value={escalateSubject}
                onChange={(e) => setEscalateSubject(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-borderGlow text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-warning/50 transition-all duration-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Case Description</label>
              <textarea
                value={escalateDesc}
                onChange={(e) => setEscalateDesc(e.target.value)}
                rows={4}
                required
                className="w-full bg-white/[0.02] border border-borderGlow text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-warning/50 transition-all duration-300 font-sans"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.03] border border-borderGlow text-gray-400 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-warning text-white hover:bg-warning-hover transition-all duration-300"
              >
                Confirm Escalation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
