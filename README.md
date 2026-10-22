# QuantaViz

AI-powered multi-format learning platform — one search, every format a student needs.

Type any academic topic and QuantaViz assembles a full learning page: theory explanation, flowcharts, 3D visualization, interactive simulations, explainer videos, reference images, and quizzes — all adapted to the subject domain.

## Features

- **Theory panel** — AI-generated explanation with structured paragraphs and bullet points
- **Mermaid flowcharts** — auto-generated diagrams for visual learners
- **3D visualization** — Three.js scenes that adapt to the topic (atom, orbit, motion, energy)
- **PhET simulations** — intelligent matching to relevant interactive simulations from PhET Colorado
- **Explainer videos** — YouTube video search and embed
- **Reference images** — Pexels and NASA APOD integration
- **Quiz** — 3 topic-specific multiple-choice questions with explanations
- **Domain-adaptive theming** — 12 academic domains, each with its own color palette and mood
- **Safety filtering** — unsafe queries are detected and rejected before AI generation
- **User accounts** — Google sign-in with search history and quiz progress saved to Firestore

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| 3D | Three.js + @react-three/fiber |
| Backend | FastAPI (Python) |
| AI | Google Gemini, Groq (GPT-OSS-20B) |
| Auth & DB | Firebase (Auth, Firestore) |
| Hosting | Firebase Hosting |
| External APIs | YouTube Data API, Pexels, NASA APOD, PhET Colorado |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Firebase project (for auth and hosting)

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GROQ_API_KEY=your_groq_key
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GROQ_MODEL=openai/gpt-oss-20b
VITE_YOUTUBE_API_KEY=your_youtube_key
VITE_PEXELS_API_KEY=your_pexels_key
VITE_NASA_API_KEY=your_nasa_key
```

Create a `backend/.env` file:

```
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
GEMINI_MODEL=gemini-2.5-flash
GROQ_MODEL=openai/gpt-oss-20b
```

## License

This project is for educational purposes.
