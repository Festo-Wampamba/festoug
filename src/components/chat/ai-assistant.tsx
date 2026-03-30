"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import type { UIMessage } from "ai";
import { Bot, X, Send, User, Sparkles, Loader2, ChevronDown } from "lucide-react";

type QuickAction = { label: string; message: string; nextTopic: string };

const quickActionMap: Record<string, QuickAction[]> = {
  initial: [
    { label: "Services & Pricing", message: "What services do you offer?", nextTopic: "services" },
    { label: "How to buy?", message: "How do I buy a template?", nextTopic: "buy" },
    { label: "About Festo", message: "Who is Festo?", nextTopic: "about" },
  ],
  services: [
    { label: "How much does it cost?", message: "How much do your services cost?", nextTopic: "cost" },
    { label: "How to hire Festo?", message: "How do I hire Festo for a project?", nextTopic: "hire" },
    { label: "See the portfolio", message: "Can I see Festo's portfolio?", nextTopic: "portfolio" },
  ],
  buy: [
    { label: "Payment methods?", message: "What payment methods do you accept?", nextTopic: "payment" },
    { label: "After purchase?", message: "Where do I download files after purchase?", nextTopic: "download" },
    { label: "Refund policy?", message: "What is the refund policy?", nextTopic: "refund" },
  ],
  about: [
    { label: "Tech stack?", message: "What technologies does Festo specialize in?", nextTopic: "technologies" },
    { label: "See portfolio", message: "Can I see Festo's portfolio?", nextTopic: "portfolio" },
    { label: "Contact Festo", message: "How can I contact Festo?", nextTopic: "contact" },
  ],
  cost: [
    { label: "Payment plans?", message: "Do you offer payment plans?", nextTopic: "payment" },
    { label: "Custom quote?", message: "How do I get a custom project quote?", nextTopic: "hire" },
    { label: "Cheapest option?", message: "What is the most affordable service available?", nextTopic: "services" },
  ],
  hire: [
    { label: "Project timeline?", message: "What is the typical project timeline?", nextTopic: "about" },
    { label: "Remote work?", message: "Do you work with international clients remotely?", nextTopic: "contact" },
    { label: "Get started?", message: "What information do you need to start a project?", nextTopic: "contact" },
  ],
  portfolio: [
    { label: "Web projects?", message: "What web development projects has Festo done?", nextTopic: "technologies" },
    { label: "Open source?", message: "Does Festo have open source work?", nextTopic: "about" },
    { label: "Hire for project?", message: "Can Festo build something similar for me?", nextTopic: "hire" },
  ],
  technologies: [
    { label: "Frontend skills?", message: "What frontend technologies does Festo use?", nextTopic: "portfolio" },
    { label: "Backend skills?", message: "What backend technologies does Festo use?", nextTopic: "portfolio" },
    { label: "Mobile apps?", message: "Does Festo build mobile applications?", nextTopic: "hire" },
  ],
  contact: [
    { label: "Email address?", message: "What is Festo's email address?", nextTopic: "hire" },
    { label: "WhatsApp?", message: "Can I contact Festo on WhatsApp?", nextTopic: "hire" },
    { label: "Start a project", message: "I want to start a project with Festo", nextTopic: "hire" },
  ],
  payment: [
    { label: "Credit card?", message: "Do you accept credit card payments?", nextTopic: "buy" },
    { label: "PayPal?", message: "Do you accept PayPal?", nextTopic: "buy" },
    { label: "Go to store", message: "How do I navigate to the store to buy?", nextTopic: "download" },
  ],
  download: [
    { label: "Customer Portal?", message: "How do I access the Customer Portal?", nextTopic: "buy" },
    { label: "File formats?", message: "What file formats are included in products?", nextTopic: "buy" },
    { label: "Commercial use?", message: "Can I use templates commercially?", nextTopic: "buy" },
  ],
  refund: [
    { label: "How to request?", message: "How do I request a refund?", nextTopic: "contact" },
    { label: "Timeframe?", message: "What is the refund timeframe?", nextTopic: "contact" },
    { label: "Contact support", message: "How do I contact support for a refund?", nextTopic: "contact" },
  ],
};

const fallbackActions: QuickAction[] = [
  { label: "Services & Pricing", message: "What services do you offer?", nextTopic: "services" },
  { label: "See Portfolio", message: "Can I see Festo's portfolio?", nextTopic: "portfolio" },
  { label: "Contact Festo", message: "How can I contact Festo?", nextTopic: "contact" },
];
import ReactMarkdown from "react-markdown";

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    setIsLarge(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isLarge;
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputLocal, setInputLocal] = useState("");
  const [lastClickedTopic, setLastClickedTopic] = useState<string | null>("initial");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLarge = useIsLargeScreen();
  const { data: session } = useSession();

  // Drag state for the toggle button (small/medium only)
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const origXRef = useRef(0);
  const origYRef = useRef(0);

  const initialMessages: UIMessage[] = [
    {
      id: "welcome-1",
      role: "assistant",
      parts: [{ type: "text", text: "Hi there! I'm **FestoAI** — your full-access tech assistant. I can help with code, debugging, tech advice, career decisions, global tech trends, or anything about Festo's portfolio and services. What can I help you with?" }],
    }
  ];
  const { messages, sendMessage, status, error, setMessages } = useChat({
    messages: initialMessages,
  });

  // Personalize welcome message when a registered user is detected
  const [welcomed, setWelcomed] = useState(false);
  useEffect(() => {
    if (welcomed || !session?.user?.name) return;
    setWelcomed(true);
    const firstName = session.user.name.split(" ")[0];
    setMessages([{
      id: "welcome-1",
      role: "assistant",
      parts: [{ type: "text", text: `Welcome back, **${firstName}**! I remember our previous conversations. I'm **FestoAI** — here to help with anything: code, tech advice, architecture, global tech trends, or Festo's services. What are you working on today?` }],
    }]);
  }, [session, welcomed, setMessages]);

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);


  // ── Pointer Events (mouse + touch unified, no race conditions, no stale closures) ─
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isLarge) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    // Always read the element's actual rendered position so drag works from CSS default too
    const rect = e.currentTarget.getBoundingClientRect();
    origXRef.current = rect.left;
    origYRef.current = rect.top;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      movedRef.current = true;
      setBtnPos({
        x: Math.max(8, Math.min(window.innerWidth - 52, origXRef.current + dx)),
        y: Math.max(8, Math.min(window.innerHeight - 52, origYRef.current + dy)),
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (!movedRef.current) setIsOpen((prev) => !prev);
  };

  const isLoadingLocally = status === "submitted" || status === "streaming";

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLocal.trim() || isLoadingLocally) return;
    setLastClickedTopic(null); // user typed — hide follow-up buttons
    sendMessage({ text: inputLocal });
    setInputLocal("");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (isLoadingLocally) return;
    setLastClickedTopic(action.nextTopic);
    sendMessage({ text: action.message });
  };

  // Chat window positioning
  return (
    <>
      {/* The Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 bg-eerie-black-1 border border-jet rounded-2xl shadow-2xl
            w-[calc(100vw-16px)] h-[55vh] right-2 bottom-20
            sm:w-[380px] sm:h-[500px] sm:right-4 sm:bottom-20
            xl:w-[380px] xl:h-[520px] xl:right-6 xl:bottom-20"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-jet bg-eerie-black-2 flex justify-between items-center shrink-0 select-none">
            <div className="flex items-center gap-2">
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
                  <div className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-jet text-light-gray' : 'bg-orange-yellow-crayola text-smoky-black'}`}>
                    {m.role === 'user' ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm ${
                    m.role === 'user'
                      ? 'bg-jet text-white-2 rounded-tr-sm'
                      : 'bg-eerie-black-1 text-light-gray border border-jet/50 rounded-tl-sm'
                  }`}>
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    ) : (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-jet prose-pre:border prose-pre:border-jet/60 max-w-none text-[11px] sm:text-xs md:text-sm">
                        <ReactMarkdown>{textContent}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}

            {isLoadingLocally && (
              <div className="flex justify-start">
                <div className="flex gap-2 sm:gap-2.5 max-w-[85%]">
                  <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-orange-yellow-crayola text-smoky-black flex items-center justify-center">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-eerie-black-1 border border-jet/50 rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce bounce-d0" />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce bounce-d150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-light-gray-70 animate-bounce bounce-d300" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center p-2.5 sm:p-3 mt-3 sm:mt-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-[10px] sm:text-xs">
                  {error.message || "Something went wrong. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => setMessages(messages)}
                  className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Actions — dynamic follow-up questions */}
          {lastClickedTopic !== null && !isLoadingLocally && messages[messages.length - 1]?.role === "assistant" && (
            <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {(quickActionMap[lastClickedTopic] ?? fallbackActions).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className="text-[9px] sm:text-[10px] px-2 py-1 sm:px-2.5 sm:py-1.5 bg-jet hover:bg-orange-yellow-crayola/20 hover:border-orange-yellow-crayola/40 text-light-gray hover:text-orange-yellow-crayola rounded-full transition-all duration-200 border border-jet/60"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 border-t border-jet bg-eerie-black-2 shrink-0">
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                className="w-full bg-smoky-black border border-jet rounded-xl pl-3 pr-10 py-2.5 sm:pl-4 sm:pr-12 sm:py-3 text-xs sm:text-sm text-white-2 placeholder:text-light-gray-70 focus:outline-none focus:border-orange-yellow-crayola/50 focus:ring-1 focus:ring-orange-yellow-crayola/50 transition-all"
                value={inputLocal}
                onChange={(e) => setInputLocal(e.target.value)}
                placeholder="Ask anything — code, tech, or about Festo..."
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

      {/* Large screen: static button */}
      {isLarge && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed z-50 bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,181,63,0.5)] active:scale-95 ${
              isOpen ? 'bg-jet text-white-2' : 'bg-orange-yellow-crayola text-smoky-black'
            }`}
            aria-label="Toggle AI Chat"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </button>
          {!isOpen && (
            <span className="fixed bottom-[calc(1.5rem+3rem)] right-6 w-4 h-4 bg-green-400 border-2 border-smoky-black rounded-full animate-pulse z-50 pointer-events-none" />
          )}
        </>
      )}

      {/* Small/medium screen: draggable button — renders immediately via CSS */}
      {!isLarge && (
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`fixed z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,181,63,0.3)] transition-shadow duration-300 active:scale-95 touch-none ${
            isOpen ? "bg-jet text-white-2" : "bg-orange-yellow-crayola text-smoky-black"
          } ${!btnPos ? "bottom-20 right-4" : "chat-btn-dragged"}`}
          /* eslint-disable-next-line react/forbid-component-props */
          style={btnPos ? ({ "--bx": `${btnPos.x}px`, "--by": `${btnPos.y}px` } as React.CSSProperties) : undefined}
          aria-label="Toggle AI Chat"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-smoky-black rounded-full animate-pulse pointer-events-none" />
          )}
        </button>
      )}
    </>
  );
}
