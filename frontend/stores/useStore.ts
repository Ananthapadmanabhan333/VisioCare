import { create } from 'zustand';

// Type definitions matching database models and schemas
export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'assistant' | 'system';
  content: string;
  screenshot_url?: string;
  ocr_payload?: { text?: string };
  diagnostic_payload?: {
    error_code?: string;
    root_cause?: string;
    troubleshooting_steps?: string[];
    bounding_boxes?: Array<{ label: string; coords: [number, number, number, number] }>;
    kb_suggestions?: Array<{ title: string; content: string; category: string }>;
    inference_mode?: string;
    latency_ms?: number;
  };
  emotion_payload?: {
    frustration_score?: number;
    urgency_score?: number;
    detected_sentiment?: string;
    tone_guidance?: string;
  };
  reasoning_trace?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  status: 'active' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  emotion_summary?: {
    average_frustration: number;
    sentiment_history: string[];
  };
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Ticket {
  id: string;
  conversation_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  root_cause_prediction?: string;
  ai_escalation_summary?: string;
  resolution_steps?: string[];
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  total_conversations: number;
  total_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  escalation_rate_pct: number;
  resolution_rate_pct: number;
  average_vlm_latency_ms: number;
  average_frustration_index: number;
  error_frequency: Array<{ code: string; count: number }>;
  sentiment_distribution: Array<{ sentiment: string; count: number }>;
  latency_trend: Array<{ timestamp: string; latency: number; ocr_accuracy: number }>;
}

interface VisioCareState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeMessages: Message[];
  tickets: Ticket[];
  activeTicket: Ticket | null;
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, screenshot?: File) => Promise<void>;
  fetchTickets: () => Promise<void>;
  selectTicket: (id: string) => Promise<void>;
  escalateTicket: (conversationId: string, subject: string, description: string, priority?: string) => Promise<void>;
  updateTicketStatus: (id: string, status: Ticket['status']) => Promise<void>;
  fetchAnalytics: () => Promise<void>;
}

export const useStore = create<VisioCareState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  activeMessages: [],
  tickets: [],
  activeTicket: null,
  analytics: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/v1/conversations');
      if (!res.ok) throw new Error('Failed to load conversations.');
      const data = await res.json();
      set({ conversations: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createConversation: async (title = "New Support Session") => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', title);
      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to start chat session.');
      const data = await res.json();
      
      const currentConvs = get().conversations;
      set({ 
        conversations: [data, ...currentConvs], 
        activeConversation: data, 
        activeMessages: [],
        isLoading: false 
      });
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  selectConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/v1/conversations/${id}`);
      if (!res.ok) throw new Error('Failed to retrieve conversation.');
      const data = await res.json();
      set({ 
        activeConversation: data, 
        activeMessages: data.messages || [], 
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  sendMessage: async (conversationId, content, screenshot) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      // Add temporary user message for immediate UI update
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_type: 'user',
        content,
        screenshot_url: screenshot ? URL.createObjectURL(screenshot) : undefined,
        created_at: new Date().toISOString(),
      };
      
      set(state => ({
        activeMessages: [...state.activeMessages, tempUserMsg]
      }));

      const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to deliver message.');
      const aiResponseMsg = await res.json();

      // Retrieve the actual saved user message and AI response
      const refreshedRes = await fetch(`/api/v1/conversations/${conversationId}`);
      const refreshedConvo = await refreshedRes.json();

      set(state => ({
        activeConversation: refreshedConvo,
        activeMessages: refreshedConvo.messages || [],
        conversations: state.conversations.map(c => c.id === conversationId ? refreshedConvo : c),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/v1/tickets');
      if (!res.ok) throw new Error('Failed to load tickets.');
      const data = await res.json();
      set({ tickets: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectTicket: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/v1/tickets/${id}`);
      if (!res.ok) throw new Error('Failed to fetch ticket detailed profile.');
      const data = await res.json();
      set({ activeTicket: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  escalateTicket: async (conversationId, subject, description, priority = "high") => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          subject,
          description,
          priority
        }),
      });
      if (!res.ok) throw new Error('Fail automated agent ticket escalation.');
      const ticketData = await res.json();
      
      // Update conversations list to sync escalated status
      const updatedConvs = get().conversations.map(c => {
        if (c.id === conversationId) {
          return { ...c, status: 'escalated' as const };
        }
        return c;
      });

      set(state => ({
        tickets: [ticketData, ...state.tickets],
        conversations: updatedConvs,
        activeConversation: state.activeConversation?.id === conversationId 
          ? { ...state.activeConversation, status: 'escalated' as const } 
          : state.activeConversation,
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateTicketStatus: async (id: string, status: Ticket['status']) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/v1/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update ticket.');
      const updatedTicket = await res.json();
      
      set(state => ({
        tickets: state.tickets.map(t => t.id === id ? updatedTicket : t),
        activeTicket: state.activeTicket?.id === id ? updatedTicket : state.activeTicket,
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/v1/analytics/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard metrics.');
      const data = await res.json();
      set({ analytics: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
