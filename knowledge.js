const profileKnowledge = [
  {
    title: "Positioning",
    content: "Sayan Pal Chowdhury is a Data, Backend and AI Builder from Kolkata. He has professional experience at Infosys with Java and Selenium automation, moved into data analytics using Python, SQL, Excel and Power BI, and built Zuno as a real business operations platform for small shops."
  },
  {
    title: "Why hire Sayan",
    content: "Sayan combines real business context, software building, data analytics and AI integration. He did not only make tutorial projects; he built Zuno from scratch for practical shop operations, handling real sales, inventory, credit, delivery and reporting workflows, then upgraded it with LLM, RAG, embeddings, Qdrant vector search and LangChain."
  },
  {
    title: "Zuno",
    content: "Zuno is a full-stack SaaS-style business operations platform for small shops. It covers sales, billing, inventory, credit, customer storefront, order tracking, analytics and PWA access. It uses Firebase Authentication, Firestore, Node.js backend, Railway deployment, Gemini AI, LangChain, embeddings and Qdrant vector database."
  },
  {
    title: "AI architecture",
    content: "Sayan integrated Gemini for LLM-based assistance, RAG over business data, embeddings for semantic memory, Qdrant as vector database, and LangChain for structured backend business query workflows. Zuno can remember notes like customer habits and retrieve them semantically."
  },
  {
    title: "Data projects",
    content: "Sayan built PhonePe Digital Payments Analysis using Python, Pandas and NumPy; E-Commerce Customer and Sales Analysis using SQL; and Sales and Inflation dashboards using Power BI and Excel."
  },
  {
    title: "Frontend projects",
    content: "Sayan OS includes JavaScript proof modules such as a Snake Game and Daily Expense Tracker to show DOM logic, state management, browser interaction, keyboard controls, local storage and responsive UI work."
  },
  {
    title: "TinyGPT",
    content: "Sayan started ZunoTinyGPT, a small GPT-style Transformer project in PyTorch for learning LLM internals such as tokenization, embeddings, positional embeddings, causal self-attention, training loops and inference APIs."
  },
  {
    title: "Skills",
    content: "Sayan works with JavaScript, Node.js, Firebase, MongoDB, Python, SQL, Pandas, NumPy, Power BI, Excel, Java, Selenium, LLMs, RAG, embeddings, Qdrant, LangChain, GitHub and deployment workflows."
  },
  {
    title: "Career journey",
    content: "Sayan's journey moved from Java Selenium automation at Infosys to data analytics and backend systems, then into building Zuno around real shop and wholesale operations from scratch, and finally into AI engineering concepts through RAG, vector databases, LangChain and small Transformer learning."
  }
];

function retrieveKnowledge(question, limit = 4) {
  const terms = String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const scored = profileKnowledge.map(item => {
    const haystack = `${item.title} ${item.content}`.toLowerCase();
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
    return { ...item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(item => item.score > 0 || terms.length === 0);
}

module.exports = { profileKnowledge, retrieveKnowledge };
