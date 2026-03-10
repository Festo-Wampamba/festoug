"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, X, Send, User, Sparkles, Loader2, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputLocal, setInputLocal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Vercel AI SDK handles state, streaming, and API communication natively
  const { messages, sendMessage, status, error, setMessages } = useChat({
    api: "/api/chat",
    // Optional: add a welcome message locally if empty
    initialMessages: [
      {
        id: "welcome-1",
        role: "assistant",
        content: "Hi there! 👋 I'm Festo's AI Assistant. I can help you navigate the portfolio, answer questions about Festo's skills, or guide you on how to purchase digital products and services. How can I help you today?",
      }
    ]
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const isLoadingLocally = status === "submitted" || status === "streaming";

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLocal.trim() || isLoadingLocally) return;

    // @ts-ignore - Bypass Vercel SDK 6.x strict message schema types for standard text insertion
    sendMessage({ role: "user", content: inputLocal });
    setInputLocal("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* The Chat Window */}
      {isOpen && (
        <div className="mb-4 w-full sm:w-[380px] h-[500px] max-h-[85vh] bg-eerie-black-1 border border-jet rounded-2xl shadow-2 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="p-4 border-b border-jet bg-eerie-black-2 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-orange-yellow-crayola/20 rounded-lg text-orange-yellow-crayola">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white-2 font-semibold text-sm">Festo AI Assistant</h3>
                <p className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-light-gray-70 hover:text-white-2 rounded-lg hover:bg-jet/50 transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-jet text-light-gray' : 'bg-orange-yellow-crayola text-smoky-black'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  {/* Bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-jet text-white-2 rounded-tr-sm' 
                      : 'bg-[#2a2a2a] text-light-gray border border-jet/50 rounded-tl-sm'
                  }`}>
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-jet prose-pre:border prose-pre:border-jet/60 max-w-none text-xs sm:text-sm">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoadingLocally && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[#2a2a2a] border border-jet/50 rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="text-center p-3 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
                <button 
                  onClick={() => handleManualSubmit(new Event('submit') as any)}
                  className="mt-2 text-xs text-red-300 underline"
                >
                  Retry
                </button>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions (only show if few messages to not crowd space) */}
          {messages.length <= 2 && !isLoadingLocally && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              <button 
                onClick={() => setMessages([...messages, { id: Date.now().toString(), role: 'user', content: 'What services do you offer?' }])}
                className="text-[10px] px-2.5 py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                Services & Pricing
              </button>
              <button 
                onClick={() => setMessages([...messages, { id: Date.now().toString(), role: 'user', content: 'How do I buy a template?' }])}
                className="text-[10px] px-2.5 py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                How to buy?
              </button>
              <button 
                onClick={() => setMessages([...messages, { id: Date.now().toString(), role: 'user', content: 'Who is Festo?' }])}
                className="text-[10px] px-2.5 py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                About Festo
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-jet bg-eerie-black-2 shrink-0">
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                className="w-full bg-smoky-black border border-jet rounded-xl pl-4 pr-12 py-3 text-sm text-white-2 placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all"
                value={inputLocal}
                onChange={(e) => setInputLocal(e.target.value)}
                placeholder="Ask about my portfolio..."
                disabled={isLoadingLocally}
              />
              <button
                type="submit"
                disabled={isLoadingLocally || !inputLocal.trim()}
                className="absolute right-2 p-2 rounded-lg bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingLocally ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-center mt-2 text-[9px] text-light-gray-70">
              AI can make mistakes. Check important pricing info.
            </p>
          </div>
        </div>
      )}

      {/* The Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${
          isOpen 
            ? 'bg-jet text-white-2 rotate-90' 
            : 'bg-orange-yellow-crayola text-smoky-black'
        }`}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Online indicator dot when closed */}
      {!isOpen && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-smoky-black rounded-full animate-pulse" />
      )}
    </div>
  );
}
