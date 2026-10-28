"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { useWheelDrive } from "./use-wheel-drive";
import type { UIMessage } from "ai";
import {
  ChevronDownIcon,
  Cross2Icon,
  LaptopIcon,
  PaperPlaneIcon,
  PersonIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";

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

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputLocal, setInputLocal] = useState("");
  const [lastClickedTopic, setLastClickedTopic] = useState<string | null>("initial");
  const messageListRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wheelRef = useRef<HTMLElement>(null);
  const { soundEnabled, soundLoading, soundError, toggleSound } = useWheelDrive(wheelRef, isOpen);
  const pathname = usePathname();
  const { data: session } = useSession();

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
    // One-shot personalization when the auth session resolves (external data)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWelcomed(true);
    const firstName = session.user.name.split(" ")[0];
    setMessages([{
      id: "welcome-1",
      role: "assistant",
      parts: [{ type: "text", text: `Welcome back, **${firstName}**! I remember our previous conversations. I'm **FestoAI** — here to help with anything: code, tech advice, architecture, global tech trends, or Festo's services. What are you working on today?` }],
    }]);
  }, [session, welcomed, setMessages]);

  useEffect(() => {
    let frame = 0;
    const positionWheel = () => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      // The route layout may stream in after the assistant first mounts.
      const body = document.querySelector(".portfolio-body");
      const footer = document.querySelector(".site-footer");
      const bodyRight = body?.getBoundingClientRect().right;
      // Let 8px of the tire sit inside the panel edge, within its empty padding.
      const right = bodyRight == null ? 12 : Math.max(12, document.documentElement.clientWidth - bodyRight - 48);
      const footerTop = footer?.getBoundingClientRect().top;
      const bottom = Math.min(
        Math.max(16, footerTop != null ? window.innerHeight - footerTop + 12 : 16),
        Math.max(16, window.innerHeight - 168),
      );
      wheel.style.setProperty("--wheel-right", `${right}px`);
      wheel.style.setProperty("--wheel-bottom", `${bottom}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(positionWheel);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    positionWheel();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, [pathname]);

  const closeChat = () => {
    dialogRef.current?.close();
    setIsOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  };

  const containDialogFocus = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]'
    )).filter(element => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first && last) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last && first) {
      event.preventDefault();
      first.focus();
    }
  };

  // Native modal behavior contains keyboard focus and supports Escape to close.
  useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [messages, isOpen]);

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

  const launcher = (
      <aside ref={wheelRef} className="assistant-wheel" aria-label="AI assistant access">
        <span className="assistant-mobile-label" aria-hidden="true">Festo AI</span>
        <button
          type="button"
          ref={launcherRef}
          onClick={() => { if (isOpen) closeChat(); else setIsOpen(true); }}
          className="assistant-launcher inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 motion-safe:active:scale-95"
          aria-label={isOpen ? "Close Festo AI assistant" : "Open Festo AI assistant"}
          aria-expanded={isOpen}
          aria-controls={isOpen ? "festo-ai-dialog" : undefined}
          title="Festo AI assistant"
        >
          <span className="assistant-tire" aria-hidden="true"><span className="assistant-rim" /></span>
          <span className="assistant-hub">{isOpen ? <Cross2Icon className="size-4" aria-hidden /> : <LaptopIcon className="size-4" aria-hidden />}</span>
        </button>
      </aside>
  );

  // Chat window positioning
  return (
    <>
      {/* The Chat Window */}
      {isOpen && (
        <dialog
          ref={dialogRef}
          id="festo-ai-dialog"
          aria-label="Festo AI Assistant"
          onKeyDown={containDialogFocus}
          onCancel={event => { event.preventDefault(); closeChat(); }}
          onClose={() => { setIsOpen(false); launcherRef.current?.focus({ preventScroll: true }); }}
          className="assistant-panel flex flex-col overflow-hidden border border-border bg-card text-card-foreground rounded-2xl shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border bg-secondary/50 flex justify-between items-center shrink-0 select-none">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <LaptopIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold text-base">Festo AI Assistant</h3>
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> AI assistant
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 transition-colors"
              aria-label="Minimize chat"
            >
              <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex shrink-0 flex-col items-end border-b border-border px-3">
            <button type="button" onClick={toggleSound} aria-pressed={soundEnabled} disabled={soundLoading}
              className="inline-flex min-h-11 items-center gap-2 rounded-md text-xs text-muted-foreground hover:text-primary disabled:opacity-50">
              {soundLoading ? "Loading engine sound…" : `Engine sound: ${soundEnabled ? "on" : "off"}`}
            </button>
            <p role="status" className="text-xs text-muted-foreground">
              {soundError || (soundEnabled ? "Engine idles when stopped. Close the chat and scroll to rev." : "")}
            </p>
          </div>

          {/* Messages Area */}
          <div ref={messageListRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scroll-smooth">
            {messages.map((m) => {
              const textContent = m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") || "";
              return (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                    {m.role === 'user' ? <PersonIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <LaptopIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-base ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground border border-border rounded-tl-sm'
                  }`}>
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    ) : (
                      <div className="prose prose-p:leading-relaxed prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-pre:border prose-pre:border-border max-w-none text-base">
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
                  <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <LaptopIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-muted border border-border rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce bounce-d0" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce bounce-d150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce bounce-d300" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center p-2.5 sm:p-3 mt-3 sm:mt-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-destructive text-base">
                  {error.message || "Something went wrong. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={() => setMessages(messages)}
                  className="mt-1.5 sm:mt-2 inline-flex min-h-11 items-center px-2 text-base text-destructive underline underline-offset-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions — dynamic follow-up questions */}
          {lastClickedTopic !== null && !isLoadingLocally && messages[messages.length - 1]?.role === "assistant" && (
            <div className="assistant-quick-actions px-3 sm:px-4 pb-2 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {(quickActionMap[lastClickedTopic] ?? fallbackActions).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  className="min-h-11 rounded-xl border border-border bg-secondary px-3 text-xs text-secondary-foreground hover:border-primary/50 hover:bg-secondary/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 border-t border-border bg-secondary/50 shrink-0">
            <form onSubmit={handleManualSubmit} className="relative flex items-center">
              <input
                className="w-full min-h-11 bg-background border border-border rounded-xl pl-3 pr-14 sm:pl-4 sm:pr-16 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                aria-label="Message Festo AI"
                value={inputLocal}
                onChange={(e) => setInputLocal(e.target.value)}
                placeholder="Ask anything — code, tech, or about Festo..."
                disabled={isLoadingLocally}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoadingLocally || !inputLocal.trim()}
                className="absolute right-1 sm:right-1.5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:pointer-events-none disabled:opacity-50 transition-colors"
              >
                {isLoadingLocally ? <ReloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 motion-safe:animate-spin" /> : <PaperPlaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            </form>
            <p className="text-center mt-1.5 sm:mt-2 text-xs text-muted-foreground">
              AI can make mistakes. Check important pricing info.
            </p>
          </div>
        </dialog>
      )}

      {launcher}
    </>
  );
}
