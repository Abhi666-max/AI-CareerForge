<div align="center">

<h1>⚡ AI CareerForge</h1>
<p><strong>Interview Readiness Platform — Know Your Aura Score Before the Interview</strong></p>

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama_3-f97316?style=flat-square)](https://groq.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Demo →](https://ai-career-forge-nu.vercel.app/)** &nbsp;·&nbsp; Built by [Abhijeet Kangane](https://github.com/abhi666-max)

</div>

---

## What is AI CareerForge?

AI CareerForge is a premium, production-grade SaaS interview readiness platform. Upload your resume, answer one 30-second spoken question, and receive a personalised **Aura Score** — a composite evaluation across 4 pillars — powered by Google Gemini and Groq AI. The entire flow takes under 2 minutes.

---

Live Demo link : https://youtu.be/IDMlQbMhgKA



---

## Screenshots

| Landing (2-col Hero) | Micro Interview | Aura Dashboard |
|---|---|---|
| Hero with dropzone | 30s recorded response | Radar chart + feedback cards |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router                │
│                                                          │
│  page.tsx (AppPhase state machine)                       │
│    upload → interview → dashboard                        │
│                                                          │
│  /api/analyze (POST)                                     │
│    ├── pdf-parse    → resume text                        │
│    ├── Gemini 1.5 Flash → pillar scores + feedback       │
│    └── Groq Llama 3  → communication score (audio)       │
│                                                          │
│  Firebase Firestore → persist anonymised reports         │
└─────────────────────────────────────────────────────────┘
```

### AI Pipeline

| Stage | Model | Purpose |
|---|---|---|
| Resume Parsing | `pdf-parse` | Extract text from PDF in memory |
| Resume Scoring | `gemini-1.5-flash` | Technical, Portfolio & Resume Strength scores + personalised feedback |
| Audio Scoring | `llama3-8b-8192` (Groq) | Communication score from browser `SpeechRecognition` transcript |
| Persistence | Firebase Firestore | Anonymous report storage (score data only) |

### Score Pillars

| Pillar | Source | Weight |
|---|---|---|
| Technical Skills | Gemini | 25% |
| Portfolio | Gemini | 25% |
| Resume Strength | Gemini | 25% |
| Communication | Groq | 25% |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Vanilla CSS design tokens |
| Animations | Framer Motion |
| AI — Resume | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| AI — Audio | Groq Llama 3 (`groq-sdk`) |
| PDF Parsing | `pdf-parse` (with Node.js DOM polyfills) |
| Database | Firebase Firestore |
| Icons | Lucide React |
| Charts | Recharts |
| Fonts | Outfit + Inter (Google Fonts) |

---

## Local Development

### Prerequisites

- Node.js 20+
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))
- A Groq API key ([get one free](https://console.groq.com))
- A Firebase project with Firestore enabled

### 1. Clone & Install

```bash
git clone https://github.com/abhi666-max/ai-careerforge.git
cd ai-careerforge
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```bash
# AI Keys
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Firebase (Web SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **⚠️ Security:** Never commit `.env.local`. It is already in `.gitignore`.

### 3. Run

```bash
npm run dev        # Development server → http://localhost:3000
npm run build      # Production build (verify before deploy)
npm run lint       # ESLint check
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main page (AppPhase state machine)
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Design tokens + utilities
│   └── api/
│       └── analyze/
│           └── route.ts          # AI orchestration endpoint
├── components/
│   ├── Navbar.tsx                # Sticky nav with right-aligned links + CTA
│   ├── ResumeDropzone.tsx        # Drag-and-drop PDF upload
│   ├── MicroInterview.tsx        # Audio recording + SpeechRecognition
│   ├── AuraDashboard.tsx         # Score display + feedback cards
│   ├── AuraScoreRing.tsx         # Animated SVG ring
│   ├── RecordingTimer.tsx        # Countdown ring (useEffect driven)
│   ├── AudioWaveform.tsx         # Real-time audio visualiser
│   ├── FeedbackCard.tsx          # Prioritised action card
│   ├── RadarChart.tsx            # 4-pillar radar
│   ├── QuestionCard.tsx          # Typewriter question display
│   ├── HowItWorksSection.tsx     # Landing: 3-step animated cards
│   └── FeaturesSection.tsx       # Landing: 6-feature stagger grid
└── lib/
    └── firebase.ts               # Firebase client init
```

---

## Key Design Decisions

- **Zero mock data** — The dashboard renders nothing unless the `/api/analyze` route returns a successful response. A clear error state is shown on failure.
- **DOMMatrix polyfill** — `pdf-parse` uses `pdf.js` which references browser canvas APIs (`DOMMatrix`, `Path2D`, `ImageData`) during font rendering. These are stubbed at the top of `route.ts` to allow server-side parsing.
- **useEffect-driven countdown** — The 30-second recording timer uses a `useEffect` + `setTimeout` chain instead of `setInterval` to avoid React closure staleness issues.
- **State machine** — `AppPhase` (`upload → interview → dashboard`) prevents partial states and makes the flow fully deterministic.
- **Turbopack + pdf-parse** — pdf-parse must be loaded with `require()` (not `import`) to avoid Turbopack ESM module format incompatibility. The module's function is unwrapped via `module.default ?? module` to handle different bundler wrapping behaviours.

---

## Browser Requirements

| Feature | Requirement |
|---|---|
| PDF Upload | All modern browsers |
| Audio Recording | Chrome / Edge (WebRTC) |
| Speech Recognition | Chrome / Edge (`webkitSpeechRecognition`) |

> **Note:** Firefox does not support `webkitSpeechRecognition`. Use Chrome or Edge for the full experience.

---

## Deployment (Vercel)

```bash
# One-click deploy via Vercel CLI
npx vercel --prod
```

Set all `.env.local` variables as **Environment Variables** in your Vercel project settings before deploying.

---

## Roadmap

- [ ] Firebase Auth — persistent user sessions + history
- [ ] Job description matching — score against specific JD keywords
- [ ] PDF report download (jsPDF)
- [ ] Multi-question interview mode
- [ ] Mobile responsive audio recording

---

## License

MIT © 2025 [Abhijeet Kangane](https://github.com/abhi666-max)

---

<div align="center">
<p>Built with ❤️ using Next.js · Google Gemini · Groq · Firebase</p>
</div>
