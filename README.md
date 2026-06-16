# Sayan OS

An AI-enabled animated portfolio for Sayan Pal Chowdhury.

## What It Shows

- Zuno as the flagship AI business platform
- AI assistant that answers recruiter questions about Sayan
- JavaScript proof modules: Snake Game and Daily Expense Tracker
- Data analytics and backend project links
- Career timeline from automation to data/backend to AI systems

## Run Locally

The frontend can be opened directly with `public/index.html`.

For AI assistant backend:

```powershell
cd C:\Users\sayan\OneDrive\Desktop\SayanOS
npm.cmd install
copy .env.example .env
# add GEMINI_API_KEY in .env
npm.cmd start
```

Open:

```text
http://localhost:8090
```

## AI Stack

- LLM: Gemini
- RAG: Structured portfolio knowledge base
- Backend: Node.js + Express
- Frontend: HTML, CSS, JavaScript
- Future: Qdrant portfolio memory and ZunoTinyGPT experimental model toggle
