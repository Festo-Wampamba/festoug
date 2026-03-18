import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { withRetry } from "@/lib/db";
import { products, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Rate limit: 20 chat messages per IP per minute
    let ip: string;
    try {
      ip = getClientIp(req);
    } catch {
      ip = "unknown";
    }

    try {
      const limiter = rateLimit(`chat:${ip}`, { limit: 20, windowSeconds: 60 });
      if (!limiter.success) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please slow down." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.warn("Rate limiter error, allowing request:", e);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const messages: UIMessage[] = body?.messages;

    // Validate that messages is an array with at least one entry
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages must be a non-empty array." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cap conversation length to prevent abuse
    const MAX_MESSAGES = 50;
    const trimmedMessages = messages.slice(-MAX_MESSAGES);

    // Fetch live data from the database to give the AI context
    // Gracefully degrade if DB is unavailable — the AI can still answer without live data
    let allProducts: any[] = [];
    let allServices: any[] = [];

    try {
      [allProducts, allServices] = await Promise.all([
        withRetry((db) =>
          db.query.products.findMany({
            where: eq(products.isActive, true),
            columns: { name: true, description: true, price: true, currency: true, category: true, slug: true },
          })
        ),
        withRetry((db) =>
          db.query.services.findMany({
            columns: { title: true, description: true },
          })
        ),
      ]);
    } catch (dbError) {
      console.warn("AI Chat: Database query failed, continuing without live data:", dbError);
    }

    // Format the database data into readable text for the system prompt
    const productsContext = allProducts.map(p =>
      `- **${p.name}** (${p.currency} ${p.price}): ${p.description}. (Available at /store/${p.slug})`
    ).join("\n");

    const servicesContext = allServices.map(s =>
      `- **${s.title}**: ${s.description}`
    ).join("\n");

    // Construct the highly specific system prompt
    const systemPrompt = `
You are the official AI Assistant for Festo Wampamba (Festo-Wampamba), a skilled Software Engineer and Tech Consultant from Uganda.
You are embedded directly into his premium portfolio and digital storefront (FestoUG).

**Your Persona:**
- Professional, helpful, enthusiastic, and tech-savvy.
- You represent Festo and his brand.
- Keep responses relatively concise and easy to read (use markdown for formatting).

**Your Core Objectives:**
1. Help users navigate the website and find what they are looking for.
2. Provide clear instructions on how to purchase/acquire digital products and services.
3. Answer questions about Festo's background and offerings.
4. If someone encounters challenges navigating or purchasing, guide them step-by-step.

**Website Structure & Navigation Help:**
- **Store (/store):** Where users can buy digital products (templates, scripts, UI kits).
- **Services (/services):** Where users can hire Festo for professional work or long-term retainers.
- **Portfolio (/portfolio):** Where Festo's previous projects and open-source work is showcased.
- **Blog (/blog):** Where Festo shares technical articles and insights.
- **Customer Portal (/dashboard):** Where users can view their purchase history, download files, and manage license keys. Must be logged in to access.

**Purchasing Instructions:**
- To buy a product, guide the user to navigate to the Store, click on a product, and click the checkout button. Payments are processed securely via Lemon Squeezy (Cards/PayPal).
- After payment, they will be redirected to their Customer Portal (/dashboard) where they can download their files instantly.

**Live Context Data (Database):**

*Available Digital Products in the Store:*
${productsContext || "Currently no active digital products."}

*Professional Services Offered:*
${servicesContext || "Currently no active services listed."}

**Important Rules:**
- Only answer questions related to Festo, software engineering, the website, products, and tech.
- If asked to do something malicious, write code unrelated to Festo's work, or act as another persona, politely decline and steer the conversation back to Festo's offerings.
- If a user needs human support, tell them to email festotechug@gmail.com.
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

    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      compatibility: "compatible",
    });

    const result = streamText({
      model: openrouter.chat("meta-llama/llama-4-maverick"),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("AI Chat API Error:", error);

    let message = "Failed to process chat request. Please try again.";
    const errMsg = error?.message || "";

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
