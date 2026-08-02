import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, RefreshCw, BookOpen, Layers, Lightbulb, MessageSquare } from 'lucide-react';
import { MOCK_CHAT_SEED, MOCK_RAG_RESPONSES } from '../data/mockData';
import { ChatMessage } from '../types';
import { ChatBubble } from '../components/ui/ChatBubble';
import { Button } from '../components/ui/Button';

export const TrendQueryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_SEED);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What visual themes are surging in Gen-Z streetwear?',
    'Explain why raw clay ceramics are going viral on TikTok.',
    'What aesthetics are trending for home desk setups?',
    'Forecast popular color palettes for Autumn 2026.'
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle URL search param if passed from Header
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSendQuery(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    // Simulate RAG vector retrieval & response generation
    setTimeout(() => {
      let aiMsg: ChatMessage;

      const lower = queryText.toLowerCase();
      if (lower.includes('fashion') || lower.includes('streetwear') || lower.includes('chrome') || lower.includes('y2k')) {
        aiMsg = MOCK_RAG_RESPONSES.fashion;
      } else if (lower.includes('ceramic') || lower.includes('pottery') || lower.includes('clay') || lower.includes('home')) {
        aiMsg = MOCK_RAG_RESPONSES.ceramic;
      } else {
        // Generic smart RAG response fallback
        aiMsg = {
          id: `resp-${Date.now()}`,
          sender: 'assistant',
          content: `### 🔍 Gemini 3.6 Multimodal RAG Analysis\n\nQuerying **486,000 indexed social posts** for: **"${queryText}"**\n\n1. **Visual Signal Retrieval**:\n   - Retained **14 relevant cluster centroids** matching visual concepts in CLIP embedding space.\n   - High aesthetic alignment in **Fashion & Lifestyle** taxonomies (+210% growth rate).\n\n2. **Engagement Prediction**:\n   - Content adhering to these visual patterns receives **3.4x higher average comment density**.\n   - Peak engagement window occurs between **5 PM and 9 PM EST** on video-first platforms.\n\n3. **Strategic Playbook**:\n   - Incorporate natural ambient lighting, high contrast visual subjects, and tactile surface textures to maximize viral probability.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citationSource: 'FAISS Vector Database (SMPD 486k Index)',
          ragConfidence: 93.2
        };
      }

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Perplexity & Gemini RAG Conversational Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">TrendLens AI Assistant</h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Ask plain-English questions about visual trends, color palettes, and viral growth velocity.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(prompt)}
            disabled={isGenerating}
            className="text-xs font-medium px-3 py-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-xs">{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-6 border border-zinc-800 min-h-[480px] max-h-[600px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBubble message={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Loader Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 w-fit">
            <Bot className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-xs font-semibold text-zinc-300 animate-pulse">
              Retrieving FAISS embeddings & generating response...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery(inputQuery);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI about social visual trends (e.g. 'What is the top color palette for Y2K chrome?')..."
          disabled={isGenerating}
          className="w-full pl-5 pr-28 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 shadow-xl"
        />

        <Button
          type="submit"
          variant="gradient"
          size="sm"
          disabled={!inputQuery.trim() || isGenerating}
          className="absolute right-2"
          icon={<Send className="w-3.5 h-3.5" />}
        >
          Send
        </Button>
      </form>

    </div>
  );
};
