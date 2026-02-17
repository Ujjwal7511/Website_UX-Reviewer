# Website UX Reviewer

An AI-powered web application that evaluates a website's user experience and generates structured insights, usability issues, and actionable improvement suggestions.

Paste a website URL to receive a detailed UX review including categorized issues, supporting evidence, before/after recommendations, and an overall usability score.

## Features

- **URL input** — Analyze any public website using its link
- **Page capture** — Retrieves page structure and visual snapshot for analysis
- **AI-powered review** — Generates 8–12 UX issues across key usability areas:
  - Clarity
  - Layout
  - Navigation
  - Accessibility
  - Trust
- **Evidence-based insights** — Each issue includes explanation and supporting proof
- **Before/After recommendations** — Actionable suggestions for the most critical UX issues
- **UX scoring** — Overall usability score (1–10)
- **Saved reviews** — Stores recent analyses locally for quick access
- **Export PDF** — Download UX reports for sharing or documentation

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** Groq API (llama-3.1-70b-versatile) via groq-sdk
- **Page capture:** Puppeteer (optional)
- **Storage:** localStorage for recent review history
- **PDF Export:** jsPDF + html2canvas

## Setup

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 2. Configure API key

Create a `.env` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get an API key from [Groq Console](https://console.groq.com/keys).

Optional backend configuration (server/.env):

- `GROQ_API_KEY` — Enables server-side AI review endpoint
- `SKIP_SCREENSHOT=true` — Skip page capture (HTML-only analysis)
- `PORT=3001` — Backend port

### 3. Run the app

**Terminal 1 — Backend**

```
bash
npm run server
```

**Terminal 2 — Frontend**

```
bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

The development server proxies API requests to the backend.

### Production build

```
bash
npm run build
npm run preview
```

Run the backend separately:

```
bash
npm run server
```

The frontend can call Groq directly or use the backend review endpoint depending on environment configuration.

## Project structure

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── URLInput.jsx
│   │   ├── ReviewResults.jsx
│   │   ├── SavedReviews.jsx
│   │   └── LoadingState.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── groq.js
│   │   └── storage.js
│   └── utils/
│       └── exportPdf.js
└── server/
    ├── package.json
    ├── .env.example
    └── index.js
```

## Design

- Clean, responsive UI built with Tailwind
- Structured UX report layout
- Category-based issue filtering
- Loading and error states for better user feedback
- Accessible layout and readable hierarchy
- PDF export and review persistence

## Author

Ujjwal Kumar Singh
