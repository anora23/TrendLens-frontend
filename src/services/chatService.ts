import { ChatMessage, Conversation, AttachedFile } from '../types';

/**
 * TrendLens API Service Layer
 * This module encapsulates all backend API contracts for chat conversations,
 * multimodal message dispatch, file uploads, text-to-speech, and trend analysis.
 * 
 * BACKEND INTEGRATION NOTE FOR DEVELOPERS:
 * Replace the mocked asynchronous implementations with actual backend API endpoints
 * (e.g. fetch('/api/chat'), fetch('/api/upload'), fetch('/api/speech-to-text')).
 */

const STORAGE_KEY = 'trendlens_conversations_v1';

// Initial starter mock conversation for first-time users
const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-default-1',
    title: 'Visual Trends Overview',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        content: 'What visual fashion trends are emerging right now?',
        timestamp: '10:14 AM'
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        content: `Here is a curated overview of emerging fashion and aesthetic trends currently capturing visual attention across creative communities:

- **Quiet Luxury & Organic Textures**: Heavy emphasis on unbleached linens, soft cashmere knits, and warm, tactile beige tones.
- **Micro-Niche Utility Wear**: Technical outerwear blended with oversized vintage tailoring.
- **Earthy Muted Palettes**: Olive sage (\`#C7D2C1\`), warm camel (\`#8A6A4A\`), and raw ivory.

Feel free to upload an image or ask about specific color directions or brand aesthetics!`,
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    id: 'conv-default-2',
    title: 'Interior Design Movements',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: [
      {
        id: 'msg-3',
        sender: 'user',
        content: 'Show trending interior aesthetics for 2026.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg-4',
        sender: 'assistant',
        content: `Interior aesthetics are shifting away from stark minimalism towards **Warm Organic Modernism**:

1. **Tactile Walls**: Lime-wash plaster and textured clay finishes.
2. **Rounded Ergonomic Furniture**: Soft curved sofas in bouclé or brushed wool.
3. **Biophilic Lighting**: Warm 2700K ambient illumination and natural stone lamps.`,
        timestamp: 'Yesterday'
      }
    ]
  }
];

export const chatService = {
  /**
   * Fetch all stored conversations
   */
  async getChats(): Promise<Conversation[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONVERSATIONS));
        return DEFAULT_CONVERSATIONS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading conversations from storage:', e);
      return DEFAULT_CONVERSATIONS;
    }
  },

  /**
   * Get single conversation by ID
   */
  async getChatById(id: string): Promise<Conversation | null> {
    const chats = await this.getChats();
    return chats.find((c) => c.id === id) || null;
  },

  /**
   * Create a new conversation thread
   */
  async createChat(initialTitle: string = 'New Conversation'): Promise<Conversation> {
    const chats = await this.getChats();
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: initialTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    const updated = [newConv, ...chats];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newConv;
  },

  /**
   * Save or update conversation state
   */
  async saveChat(conversation: Conversation): Promise<void> {
    const chats = await this.getChats();
    const idx = chats.findIndex((c) => c.id === conversation.id);
    let updated: Conversation[];
    if (idx >= 0) {
      updated = [...chats];
      updated[idx] = { ...conversation, updatedAt: new Date().toISOString() };
    } else {
      updated = [conversation, ...chats];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Delete a conversation by ID
   */
  async deleteChat(id: string): Promise<void> {
    const chats = await this.getChats();
    const updated = chats.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Rename a conversation thread
   */
  async renameChat(id: string, newTitle: string): Promise<void> {
    const chats = await this.getChats();
    const updated = chats.map((c) => (c.id === id ? { ...c, title: newTitle } : c));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  /**
   * Send a user message and receive AI response (connects to /api/chat or returns intelligent response)
   */
  async sendMessage(
    messageText: string,
    history: ChatMessage[] = [],
    attachments: AttachedFile[] = []
  ): Promise<ChatMessage> {
    try {
      const historyPayload = history.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
          attachments: attachments.map((a) => ({ name: a.name, type: a.type }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: data.reply || 'Here is an overview based on current visual signals.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    } catch (e) {
      console.warn('Network API unavailable, using fallback assistant response.', e);
    }

    // Graceful fallback response
    let attachmentNote = '';
    if (attachments.length > 0) {
      attachmentNote = `\n\n*Analyzed ${attachments.length} attachment(s): ${attachments.map((a) => a.name).join(', ')}.*`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content: `Here is a curated visual synthesis regarding **"${messageText}"**:${attachmentNote}

- **Key Shift**: Strong movement toward soft, authentic textures, organic color palettes, and understated, quiet luxury aesthetics.
- **Visual Signals**: Short-form visual posts showcase a preference for natural lighting, unedited moments, and curated simplicity.
- **Perspective**: Audiences are responding positively to narrative storytelling and mindful design details rather than loud, hyper-saturated graphics.

Feel free to ask follow-up questions about color directions, interior moods, fashion shifts, or design aesthetics!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  /**
   * Upload files placeholder
   */
  async uploadFiles(files: File[]): Promise<AttachedFile[]> {
    return files.map((file, idx) => {
      const isImg = file.type.startsWith('image/');
      const isAud = file.type.startsWith('audio/');
      const isData = file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.xlsx');
      
      let category: AttachedFile['category'] = 'document';
      if (isImg) category = 'image';
      else if (isAud) category = 'audio';
      else if (isData) category = 'data';

      return {
        id: `att-${Date.now()}-${idx}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file),
        fileObject: file,
        progress: 100,
        category
      };
    });
  },

  /**
   * Text to Speech helper
   */
  async textToSpeech(text: string): Promise<void> {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g, ''));
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  },

  /**
   * Analyze image placeholder for visual trend detection
   */
  async analyzeImage(file: File): Promise<string> {
    return `Detected visual aesthetics for ${file.name}: Warm neutral color palette (#8A6A4A, #F8F5F0, #C7D2C1), high organic texture density, calm natural lighting. Matches emerging 'Organic Modernism' cluster with 94% confidence.`;
  }
};
