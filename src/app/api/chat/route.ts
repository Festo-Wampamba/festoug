import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { withRetry } from "@/lib/db";
import { products, services, chatMessages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Per-visitor limit, plus a site-wide ceiling so rotating IPs cannot run up
    // model costs. ponytail: tune CHAT_GLOBAL_PER_HOUR to real traffic.
    const CHAT_GLOBAL_PER_HOUR = 300;
    const ip = getClientIp(req);
    const [perVisitor, siteWide] = await Promise.all([
      rateLimit(`chat:${ip}`, { limit: 20, windowSeconds: 60 }),
      rateLimit("chat:all", { limit: CHAT_GLOBAL_PER_HOUR, windowSeconds: 3600 }),
    ]);
    if (!perVisitor.success || !siteWide.success) {
      return new Response(
        JSON.stringify({ error: "The assistant is busy right now. Please try again in a few minutes." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    let body: { messages?: UIMessage[] };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages: UIMessage[] = body?.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages must be a non-empty array." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // This endpoint is public and every request is billed to the model provider,
    // so bound what a client can send: only user/assistant turns (a client-supplied
    // "system" turn could override the prompt), text parts only, and capped sizes.
    const MAX_MESSAGES = 50;
    const MAX_USER_MESSAGE_CHARS = 4_000;
    const MAX_TOTAL_CHARS = 40_000;

    const trimmedMessages = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && Array.isArray(m.parts))
      .map((m) => ({ ...m, parts: m.parts.filter((part) => part.type === "text") }))
      .slice(-MAX_MESSAGES);

    const textLength = (m: UIMessage) =>
      m.parts.reduce((total, part) => total + (part.type === "text" ? part.text.length : 0), 0);
    const totalChars = trimmedMessages.reduce((total, m) => total + textLength(m), 0);
    const hasOversizedUserMessage = trimmedMessages.some(
      (m) => m.role === "user" && textLength(m) > MAX_USER_MESSAGE_CHARS
    );

    if (trimmedMessages.length === 0 || hasOversizedUserMessage || totalChars > MAX_TOTAL_CHARS) {
      return new Response(
        JSON.stringify({ error: "That message is too long. Please shorten it and try again." }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check auth session for registered user memory
    let userId: string | null = null;
    let userName: string | null = null;
    let previousContext = "";

    try {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
        userName = session.user.name || null;

        // Load last 20 messages from this user's history
        const history = await withRetry((dbInstance) =>
          dbInstance
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.userId, userId!))
            .orderBy(desc(chatMessages.createdAt))
            .limit(20)
        );

        if (history.length > 0) {
          // Reverse to chronological order
          const chronological = [...history].reverse();
          previousContext = `\n\n**Previous conversation history with ${userName || "this user"}:**\n` +
            chronological
              .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
              .join("\n");
        }
      }
    } catch (authError) {
      console.warn("Auth/memory fetch failed, continuing anonymously:", authError);
    }

    // Fetch live data from the database
    let allProducts: Array<Pick<typeof products.$inferSelect, "name" | "description" | "price" | "currency" | "category" | "slug">> = [];
    let allServices: Array<Pick<typeof services.$inferSelect, "title" | "description">> = [];

    try {
      [allProducts, allServices] = await Promise.all([
        withRetry((dbInstance) =>
          dbInstance.query.products.findMany({
            where: eq(products.isActive, true),
            columns: { name: true, description: true, price: true, currency: true, category: true, slug: true },
          })
        ),
        withRetry((dbInstance) =>
          dbInstance.query.services.findMany({
            columns: { title: true, description: true },
          })
        ),
      ]);
    } catch (dbError) {
      console.warn("AI Chat: Database query failed, continuing without live data:", dbError);
    }

    const productsContext = allProducts.map((p) =>
      `- **${p.name}** (${p.currency} ${p.price}): ${p.description}. (Available at /store/${p.slug})`
    ).join("\n");

    const servicesContext = allServices.map((s) =>
      `- **${s.title}**: ${s.description}`
    ).join("\n");

    const userGreeting = userName
      ? `The user you are speaking with is **${userName}** (a registered user).`
      : "The user is browsing as a guest.";

    const systemPrompt = `
You are **FestoAI** — the intelligent assistant embedded in Festo Wampamba's portfolio and digital platform (FestoUG).
You are knowledgeable, helpful, direct, and a genuine expert in software engineering and technology.

${userGreeting}

---

## Your Capabilities (FULL ACCESS — no artificial restrictions)

You can help with **anything** the user needs, including but not limited to:
1. **Website Navigation** — guide users through festoug.com (portfolio, store, blog, services, dashboard)
2. **Tech Education** — teach programming concepts, explain code, debug issues step by step
3. **Tech Advice** — advise on tech stack choices, architecture decisions, career paths in tech
4. **Global Tech Insights** — discuss current trends (AI, Web3, cloud, mobile, DevOps, open-source)
5. **Problem Solving** — when a user is stuck, dig in, follow their exact context, and help them through it completely without losing track
6. **Code Help** — write, review, explain, or debug code in any language
7. **Decision Support** — help users choose tools, frameworks, platforms, or career paths with reasoning
8. **Festo's Offerings** — explain and sell Festo's products and services
9. **General Tech Questions** — answer any question in the tech domain honestly and with depth

## How to Engage

- **Be direct and concise** — lead with the answer, then explain
- **Follow the user's context** — never lose track of the thread; if they're debugging something, stay on it
- **Correct mistakes clearly** — if the user is wrong about something technical, say so respectfully with the correct answer and why
- **Step-by-step for complex topics** — when teaching or guiding, number your steps clearly
- **Format well** — use markdown: code blocks (\`\`\`language), bold headings, numbered lists
- **Don't abandon the user** — if a problem is complex, keep going until it's resolved
- **Be globally aware** — you are aware of current events in the tech world, major releases, and industry news up to your knowledge cutoff

## About Festo (for promotion purposes)

Festo Wampamba is a Full-Stack Software Engineer from Uganda specializing in:
- Python, JavaScript/TypeScript, React, Next.js, Node.js
- Data solutions, REST APIs, cloud infrastructure
- UI/UX design systems
- Contact: festotechug@gmail.com | WhatsApp: +256 754230525

**Website sections:**
- **Store (/store):** Digital products (templates, scripts, UI kits) — payments via Lemon Squeezy
- **Services (/services):** Hire Festo for professional work
- **Portfolio (/portfolio):** Festo's projects and case studies
- **Blog (/blog):** Technical articles and insights
- **Dashboard (/dashboard):** Customer portal for purchases and downloads (login required)

**Live Products:**
${productsContext || "No active products currently."}

**Services Offered:**
${servicesContext || "No active services currently."}

## Memory & Personalization
${previousContext || "This is a new conversation with no prior history."}

---

## What NOT to do
- Do NOT refuse to help with legitimate tech questions out of over-caution
- Do NOT generate malicious code, explain how to harm systems, or assist with clearly unethical requests
- Do NOT give harmful medical, legal, or financial advice — suggest professional consultation for those
- Do NOT share Festo's private/sensitive business data

If the user needs human support: direct them to festotechug@gmail.com
`;

    let modelMessages;
    try {
      modelMessages = await convertToModelMessages(trimmedMessages);
    } catch (conversionError) {
      console.error("AI Chat: Failed to convert messages:", conversionError);
      return new Response(
        JSON.stringify({ error: "Invalid message format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the last user message text for saving
    const lastUserMessage = trimmedMessages
      .filter((m) => m.role === "user")
      .slice(-1)[0];
    const lastUserText = lastUserMessage?.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") || "";

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = streamText({
      model: openrouter.chat("meta-llama/llama-4-maverick"),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        // Persist conversation for registered users
        if (userId && lastUserText) {
          try {
            await db.insert(chatMessages).values([
              { userId, role: "user", content: lastUserText },
              { userId, role: "assistant", content: text },
            ]);
          } catch (saveErr) {
            console.warn("Failed to save chat history:", saveErr);
          }
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI Chat API Error:", error);

    let message = "Failed to process chat request. Please try again.";
    const errMsg = error instanceof Error ? error.message : "";

    if (errMsg.includes("API key")) {
      message = "AI service configuration error. Please contact support.";
    } else if (errMsg.includes("quota") || errMsg.includes("Quota")) {
      message = "AI service is temporarily unavailable due to usage limits. Please try again later.";
    } else if (errMsg.includes("rate") || errMsg.includes("429")) {
      message = "Too many requests. Please wait a moment and try again.";
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
