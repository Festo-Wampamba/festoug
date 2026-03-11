"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Bot, X, Send, User, Sparkles, Loader2, ChevronDown, GripVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputLocal, setInputLocal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK handles state, streaming, and API communication natively
  const initialMessages: UIMessage[] = [
    {
      id: "welcome-1",
      role: "assistant",
      parts: [{ type: "text", text: "Hi there! 👋 I'm Festo's AI Assistant. I can help you navigate the portfolio, answer questions about Festo's skills, or guide you on how to purchase digital products and services. How can I help you today?" }],
    }
  ];
  const { messages, sendMessage, status, error, setMessages } = useChat({
    messages: initialMessages,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Initialize position on first open
  useEffect(() => {
    if (isOpen && !position) {
      setPosition({
        x: window.innerWidth - (window.innerWidth < 640 ? window.innerWidth : 400) - 24,
        y: window.innerHeight - (window.innerWidth < 640 ? window.innerHeight - 20 : 560) - 24,
      });
    }
  }, [isOpen, position]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!position) return;
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, origX: position.x, origY: position.y };
    setIsDragging(true);
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragRef.current.startX;
      const dy = clientY - dragRef.current.startY;

      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragRef.current.origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.origY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const isLoadingLocally = status === "submitted" || status === "streaming";

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLocal.trim() || isLoadingLocally) return;

    sendMessage({ text: inputLocal });
    setInputLocal("");
  };

  return (
    <>
      {/* The Chat Window */}
      {isOpen && position && (
        <div
          ref={containerRef}
          className="fixed z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right bg-eerie-black-1 border border-jet rounded-2xl shadow-2
            w-[calc(100vw-16px)] h-[calc(100vh-80px)] sm:w-[380px] sm:h-[500px] sm:max-h-[85vh]"
          style={{
            left: window.innerWidth < 640 ? 8 : position.x,
            top: window.innerWidth < 640 ? 10 : position.y,
          }}
        >
          {/* Header with drag handle */}
          <div
            className={`p-3 sm:p-4 border-b border-jet bg-eerie-black-2 flex justify-between items-center shrink-0 ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-light-gray-70 hidden sm:block" />
              <div className="p-1.5 bg-orange-yellow-crayola/20 rounded-lg text-orange-yellow-crayola">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <h3 className="text-white-2 font-semibold text-xs sm:text-sm">Festo AI Assistant</h3>
                <p className="text-[9px] sm:text-[10px] text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-light-gray-70 hover:text-white-2 rounded-lg hover:bg-jet/50 transition-colors"
              aria-label="Minimize chat"
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scroll-smooth">
            {messages.map((m) => {
              const textContent = m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") || "";
              return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  {/* Avatar */}
                  <div className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-jet text-light-gray' : 'bg-orange-yellow-crayola text-smoky-black'}`}>
                    {m.role === 'user' ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm ${
                    m.role === 'user'
                      ? 'bg-jet text-white-2 rounded-tr-sm'
                      : 'bg-[#2a2a2a] text-light-gray border border-jet/50 rounded-tl-sm'
                  }`}>
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    ) : (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-jet prose-pre:border prose-pre:border-jet/60 max-w-none text-[11px] sm:text-xs md:text-sm">
                        <ReactMarkdown>
                          {textContent}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoadingLocally && (
              <div className="flex justify-start">
                <div className="flex gap-2 sm:gap-2.5 max-w-[85%]">
                  <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#2a2a2a] border border-jet/50 rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center p-2.5 sm:p-3 mt-3 sm:mt-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-[10px] sm:text-xs">
                  {error.message || "Something went wrong. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMessages(messages);
                  }}
                  className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Actions (only show if few messages to not crowd space) */}
          {messages.length <= 2 && !isLoadingLocally && (
            <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => sendMessage({ text: "What services do you offer?" })}
                className="text-[9px] sm:text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                Services & Pricing
              </button>
              <button
                type="button"
                onClick={() => sendMessage({ text: "How do I buy a template?" })}
                className="text-[9px] sm:text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                How to buy?
              </button>
              <button
                type="button"
                onClick={() => sendMessage({ text: "Who is Festo?" })}
                className="text-[9px] sm:text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 bg-jet hover:bg-jet/80 text-light-gray rounded-full transition-colors border border-jet/60"
              >
                About Festo
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 border-t border-jet bg-eerie-black-2 shrink-0">
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                className="w-full bg-smoky-black border border-jet rounded-xl pl-3 pr-10 py-2.5 sm:pl-4 sm:pr-12 sm:py-3 text-xs sm:text-sm text-white-2 placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all"
                value={inputLocal}
                onChange={(e) => setInputLocal(e.target.value)}
                placeholder="Ask about my portfolio..."
                disabled={isLoadingLocally}
              />
              <button
                type="submit"
                disabled={isLoadingLocally || !inputLocal.trim()}
                className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 rounded-lg bg-orange-yellow-crayola text-smoky-black hover:bg-orange-yellow-crayola/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingLocally ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </form>
            <p className="text-center mt-1.5 sm:mt-2 text-[8px] sm:text-[9px] text-light-gray-70">
              AI can make mistakes. Check important pricing info.
            </p>
          </div>
        </div>
      )}

      {/* The Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? 'bg-jet text-white-2 rotate-90'
            : 'bg-orange-yellow-crayola text-smoky-black'
        }`}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

      {/* Online indicator dot when closed */}
      {!isOpen && (
        <span className="fixed bottom-[calc(1.5rem+2.5rem)] right-6 sm:bottom-[calc(1.5rem+3rem)] w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 border-2 border-smoky-black rounded-full animate-pulse z-50" />
      )}
    </>
  );
}
