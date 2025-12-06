import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chat } from "@google/genai";
import { Send, Menu, Plus, X, Sparkles, MessageSquare, Settings, Zap } from 'lucide-react';
import { Role, ChatMessage } from './types.ts';
import { createChatSession, sendMessageStream } from './services/geminiService.ts';
import ChatMessageBubble from './components/ChatMessageBubble.tsx';
import TypingIndicator from './components/TypingIndicator.tsx';
import Logo from './components/Logo.tsx';
import { APP_NAME } from './constants.ts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startNewChat = useCallback(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e) {
      console.warn("API Key might be missing, chat session init failed but UI will load.");
    }
    
    setMessages([
      {
        id: 'welcome',
        role: Role.MODEL,
        text: 'أهلاً يا ريس! معاك "أبورية".\nجاهز لأي مهمة، كتابة، برمجة، أو حتى دردشة رايقة. تحب نبدأ بإيه؟',
        timestamp: new Date()
      }
    ]);
    setIsLoading(false);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Safety check for missing API Key/Session
    if (!chatSessionRef.current) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: Role.MODEL,
            text: "يا ريس، شكلك نسيت تحط مفتاح الـ API. \nلازم تضيفه في الكود عشان أقدر أرد عليك.",
            timestamp: new Date(),
            isError: true
        }]);
        return;
    }

    const userText = inputValue.trim();
    setInputValue('');
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    let accumulatedText = '';

    try {
      const stream = sendMessageStream(chatSessionRef.current, userText);
      
      setMessages(prev => [
        ...prev,
        {
          id: botMessageId,
          role: Role.MODEL,
          text: '',
          timestamp: new Date()
        }
      ]);

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: accumulatedText }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "معلش يا كبير، النت عملها معايا. ممكن نجرب تاني؟",
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-100 font-sans selection:bg-pink-500/30">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
        glass-panel border-r-0 md:border-r border-white/10
      `}>
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-bold font-cairo bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {APP_NAME}
              </h1>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
             <X size={24} />
           </button>
        </div>

        <div className="px-4 mb-4">
          <button 
            onClick={startNewChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-cairo">محادثة جديدة</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
           <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 font-cairo">التاريخ</div>
           <button className="w-full text-right p-3 rounded-lg hover:bg-white/5 text-gray-300 text-sm flex items-center gap-3 transition-colors group">
              <MessageSquare size={16} className="text-gray-500 group-hover:text-pink-400" />
              <span className="truncate">أفكار لمشروع جديد</span>
           </button>
           <button className="w-full text-right p-3 rounded-lg hover:bg-white/5 text-gray-300 text-sm flex items-center gap-3 transition-colors group">
              <MessageSquare size={16} className="text-gray-500 group-hover:text-pink-400" />
              <span className="truncate">شرح كود React</span>
           </button>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Zap size={18} />
            <span className="text-sm font-medium">Upgrade Plan</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full md:w-auto">
        
        {/* Header (Mobile + Desktop) */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 glass-panel z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center gap-2">
               <Logo />
               <span className="font-bold text-lg">ABORAYA</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                <span className="text-sm text-gray-300 font-cairo">أبورية متصل وجاهز</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          <div className="max-w-4xl mx-auto flex flex-col pb-4">
             {messages.map((msg) => (
               <ChatMessageBubble key={msg.id} message={msg} />
             ))}
             {isLoading && <TypingIndicator />}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 pb-6 md:pb-8">
          <div className="max-w-4xl mx-auto relative group">
            
            {/* Gradient Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-[2rem] opacity-30 group-hover:opacity-60 blur transition duration-1000"></div>
            
            <div className="relative flex items-end glass-input rounded-[1.8rem] transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب هنا... اسأل أبورية عن أي حاجة"
                className="w-full bg-transparent border-0 focus:ring-0 py-4 pl-6 pr-14 resize-none text-gray-100 placeholder-gray-400/70 leading-relaxed font-cairo"
                rows={1}
                style={{ minHeight: '60px', maxHeight: '150px' }}
                dir="auto"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className={`absolute right-2 bottom-2.5 p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
                  inputValue.trim() && !isLoading
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-110'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Sparkles className="animate-spin" size={20} />
                ) : (
                  <Send size={20} className={inputValue.trim() ? 'ml-0.5' : ''} />
                )}
              </button>
            </div>
          </div>
          <div className="text-center mt-3">
             <p className="text-[11px] text-gray-500 font-cairo">
               أبورية مساعد ذكي، ممكن يغلط، راجع معلوماتك دايمًا.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;