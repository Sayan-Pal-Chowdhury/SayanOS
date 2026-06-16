const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { retrieveKnowledge } = require("./knowledge");

const app = express();
const PORT = process.env.PORT || 8090;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(GEMINI_API_KEY) });
});

app.post("/ask-sayan", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim().slice(0, 500);
    if (!question) return res.status(400).json({ error: "question is required" });

    const context = retrieveKnowledge(question, 5);
    if (!ai) {
      return res.json({
        mode: "local-rag-demo",
        answer: fallbackAnswer(question, context),
        sources: context.map(item => item.title),
      });
    }

    const prompt = `
You are Sayan OS, an AI-enabled portfolio assistant for Sayan Pal Chowdhury.
Answer recruiter-style questions using only the supplied portfolio context.
Be confident, specific, honest and concise. Do not invent credentials or companies.
Write 90 to 140 words. Finish with a complete final sentence.

Question:
${question}

Portfolio context:
${context.map(item => `- ${item.title}: ${item.content}`).join("\n")}

Return a helpful answer in 2 short paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.25, maxOutputTokens: 900 }
    });

    const answer = normalizeAnswer(response.text, question, context);
    res.json({
      mode: "gemini-rag",
      answer,
      sources: context.map(item => item.title),
    });
  } catch (error) {
    console.error("Ask Sayan error:", error);
    res.status(500).json({ error: "Failed to answer", details: error.message });
  }
});

function normalizeAnswer(answer, question, context) {
  const clean = String(answer || "").trim();
  if (clean.length >= 220 && /[.!?]$/.test(clean)) return clean;
  return fallbackAnswer(question, context);
}

function fallbackAnswer(question, context) {
  const q = String(question || "").toLowerCase();
  if (q.includes("hire")) {
    return "Sayan is worth hiring because he combines real business understanding with hands-on engineering. He built Zuno from scratch around practical shop operations such as sales, inventory, credit, delivery and reporting, then upgraded it with AI features including Gemini, RAG, embeddings, Qdrant vector memory and LangChain. He also brings Java/Selenium automation experience from Infosys, data analytics skills with Python, SQL, Power BI and Excel, and a clear habit of learning by building real products.";
  }
  if (q.includes("zuno") || q.includes("ai architecture") || q.includes("rag")) {
    return "Zuno is Sayan's flagship full-stack business operations platform for small shops. It covers sales, billing, inventory, credit, customer storefronts, orders, analytics and PWA access. Its AI architecture uses Gemini for LLM-based assistance, RAG over business context, embeddings for semantic memory, Qdrant as the vector database and LangChain for structured backend business-query workflows.";
  }
  if (q.includes("data") || q.includes("sql") || q.includes("analytics")) {
    return "Sayan's data work includes PhonePe transaction analysis with Python, Pandas and NumPy, e-commerce sales analysis with SQL joins and aggregations, and Power BI/Excel dashboards for sales performance, KPIs, customer behavior and inflation trends. This gives him a strong bridge between backend systems, business data and practical analytics.";
  }
  if (!context.length) {
    return "Sayan OS can answer questions about Sayan's projects, skills, Zuno, AI work, data projects and career journey.";
  }
  const joined = context.slice(0, 3).map(item => item.content).join(" ");
  return joined.length > 620 ? `${joined.slice(0, 620)}...` : joined;
}

app.listen(PORT, () => {
  console.log(`Sayan OS running at http://localhost:${PORT}`);
});
