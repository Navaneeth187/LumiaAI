import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, AlertTriangle, BrainCircuit, HeartHandshake, Zap, MessageSquarePlus, History, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, parseISO } from 'date-fns';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  metrics?: {
    emotion?: string;
    mood?: number;
    stress?: number;
    crisis?: boolean;
    strategy?: string;
    distortion?: string;
    focus?: string;
    trigger?: string;
  };
};

type Session = {
  id: number;
  start_time: string;
  first_message: string | null;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadSession = (id?: number) => {
    const url = id ? `/api/chat/history?sessionId=${id}` : '/api/chat/history';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setSessionId(data.sessionId);
        if (data.messages.length > 0) {
          setMessages(data.messages.map((m: any, i: number) => ({
            id: `hist-${i}`,
            role: m.role,
            content: m.content,
            metrics: m.metrics
          })));
        } else {
          setMessages([{
            id: 'welcome',
            role: 'ai',
            content: "Hello. I'm Lumina. I'm here to listen and help you process whatever is on your mind today. How are you feeling?"
          }]);
        }
      });
  };

  const loadSessionsList = () => {
    fetch('/api/chat/sessions')
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  useEffect(() => {
    loadSession();
    loadSessionsList();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewSession = async () => {
    try {
      const res = await fetch('/api/chat/session', { method: 'POST' });
      const data = await res.json();
      loadSession(data.sessionId);
      loadSessionsList();
      setShowSessions(false);
    } catch (e) {
      console.error("Failed to create new session", e);
    }
  };

  const handleSelectSession = (id: number) => {
    loadSession(id);
    setShowSessions(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content: userMessage.content })
      });

      if (!res.ok) {
        throw new Error('AI Generation service returned an error');
      }

      const data = await res.json();

      // Refresh sessions list to update the first message preview if it was the first message
      if (messages.length <= 1) {
        loadSessionsList();
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        metrics: data.metrics
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm having trouble connecting to my cognitive systems. Please make sure the backend is active and that your API key is correctly configured.",
        metrics: { crisis: false }
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f0] relative">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-md border-b border-[#e5e5e5] px-8 py-6 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl text-[#1a1a1a]">Companion</h2>
          <p className="text-[#5A5A40] text-sm mt-1">A safe space for emotional exploration and reflection.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSessions(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#e5e5e5] hover:bg-[#f5f5f0] transition-colors text-[#5A5A40]"
          >
            <History size={16} />
            <span className="text-sm font-medium">History</span>
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#e5e5e5]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-[#5A5A40] uppercase tracking-wider">Lumina Active</span>
          </div>
        </div>
      </header>

      {/* Sessions Sidebar */}
      <AnimatePresence>
        {showSessions && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20"
              onClick={() => setShowSessions(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-30 flex flex-col border-l border-[#e5e5e5]"
            >
              <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center bg-[#f5f5f0]/50">
                <h3 className="font-serif text-xl text-[#1a1a1a]">Conversations</h3>
                <button onClick={() => setShowSessions(false)} className="text-[#9e9e9e] hover:text-[#1a1a1a]">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <button 
                  onClick={handleNewSession}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#4a4a30] transition-colors shadow-sm"
                >
                  <MessageSquarePlus size={18} />
                  New Session
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`w-full text-left p-4 rounded-xl transition-colors border ${
                      sessionId === session.id 
                        ? 'bg-[#f5f5f0] border-[#5A5A40]/20' 
                        : 'bg-white border-transparent hover:border-[#e5e5e5] hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-[#9e9e9e] mb-1 font-medium">
                      {format(parseISO(session.start_time), 'MMM d, yyyy • h:mm a')}
                    </div>
                    <div className="text-sm text-[#1a1a1a] line-clamp-2 leading-relaxed">
                      {session.first_message || "New conversation..."}
                    </div>
                  </button>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-[#9e9e9e] text-sm mt-8">
                    No past conversations found.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-6 rounded-[32px] ${
                    msg.role === 'user'
                      ? 'bg-[#5A5A40] text-white rounded-tr-sm'
                      : 'bg-white text-[#1a1a1a] shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-tl-sm border border-[#e5e5e5]/50'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none text-[#1a1a1a]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-lg leading-relaxed">{msg.content}</p>
                  )}
                </div>
                
                {/* Metrics / Insights Bubble */}
                {msg.role === 'ai' && msg.metrics && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 ml-4 flex flex-wrap gap-2"
                  >
                    {msg.metrics.focus && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#e5e5e5] text-[#5A5A40] text-xs font-medium tracking-wide shadow-sm hover:bg-[#f5f5f0] transition-colors cursor-default">
                        <HeartHandshake size={12} className="text-[#5A5A40]" />
                        {msg.metrics.focus}
                      </span>
                    )}
                    {msg.metrics.distortion && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium tracking-wide shadow-sm hover:bg-amber-100 transition-colors cursor-default">
                        <BrainCircuit size={12} />
                        Pattern: {msg.metrics.distortion}
                      </span>
                    )}
                    {msg.metrics.strategy && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8e8e0] text-[#5A5A40] text-xs font-medium tracking-wide shadow-sm hover:bg-[#dcdcd4] transition-colors cursor-default">
                        <Sparkles size={12} />
                        Suggestion: {msg.metrics.strategy}
                      </span>
                    )}
                    {msg.metrics.trigger && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium tracking-wide shadow-sm hover:bg-blue-100 transition-colors cursor-default">
                        <Zap size={12} />
                        Trigger: {msg.metrics.trigger}
                      </span>
                    )}
                    {msg.metrics.crisis && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium tracking-wide shadow-sm animate-pulse">
                        <AlertTriangle size={12} />
                        Support Needed
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white p-6 rounded-[32px] rounded-tl-sm shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#e5e5e5]/50 flex items-center gap-3 text-[#5A5A40]">
                <div className="flex gap-1.5 items-center h-4 px-2">
                  <motion.div className="w-2 h-2 bg-[#5A5A40] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-[#5A5A40] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-[#5A5A40] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Share what's on your mind..."
            className="w-full bg-[#f5f5f0] border border-transparent focus:border-[#e5e5e5] rounded-[24px] pl-6 pr-16 py-5 text-lg focus:ring-4 focus:ring-[#5A5A40]/10 outline-none resize-none transition-all placeholder:text-[#9e9e9e]"
            rows={1}
            style={{ minHeight: '64px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-3 w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center hover:bg-[#4a4a30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
        <div className="flex justify-between items-center max-w-4xl mx-auto mt-4">
          <p className="text-xs text-[#9e9e9e]">
            Lumina is an AI companion, not a substitute for professional mental healthcare.
          </p>
          <div className="hidden md:flex gap-2">
            <button onClick={() => setInput("I'm feeling overwhelmed today.")} className="text-xs text-[#5A5A40] bg-[#f5f5f0] px-3 py-1.5 rounded-full hover:bg-[#e5e5e5] transition-colors">I'm overwhelmed</button>
            <button onClick={() => setInput("I need help reframing a negative thought.")} className="text-xs text-[#5A5A40] bg-[#f5f5f0] px-3 py-1.5 rounded-full hover:bg-[#e5e5e5] transition-colors">Help me reframe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
