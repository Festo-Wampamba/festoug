import { google } from "@ai-sdk/google";
import { streamText, UIMessage } from "ai";
import { db } from "@/lib/db";
import { products, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Fetch live data from the database to give the AI context
    const allProducts = await db.query.products.findMany({
      where: eq(products.isActive, true),
      columns: { name: true, description: true, price: true, currency: true, category: true, slug: true },
    });
    
    const allServices = await db.query.services.findMany({
      columns: { title: true, description: true },
    });

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

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), { status: 500 });
  }
}
