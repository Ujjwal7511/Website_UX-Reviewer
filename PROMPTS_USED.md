# Prompts Used for App Development

This file documents the prompts used during the development of this application.

## Prompt Categories

### 1. Project Setup & Architecture

**Prompt:** Create a React + Vite project with an Express backend for a website UX reviewer application.

**Purpose:** Initial project scaffolding, frontend-backend structure setup, establishing API communication flow

---

### 2. Frontend Components

**Prompt:** Create a URL input component with validation for http/https URLs.

**Purpose:** Build URLInput.jsx, implement client-side validation, improve UX for incorrect input handling

---

**Prompt:** Create a home page with clear steps explaining how the UX review works.

**Purpose:** Build Home.jsx, provide user guidance and onboarding, explain workflow before analysis

---

**Prompt:** Create a status page that shows health of backend, database, and LLM connection.

**Purpose:** Build Status.jsx, integrate /api/status endpoint, provide system health visibility

---

### 3. Backend API Development

**Prompt:** Create Express endpoints for:

- POST /api/fetch-page — retrieve HTML and optional screenshot
- POST /apiAction: Review code for readability, quality, and issues (see below for action prompt) — analyze HTML using Groq API
- GET /api/status — report backend, database, and LLM health

**Purpose:** Implement API layer in server/index.js, enable structured communication between frontend and AI services

---

### 4. AI Integration & Prompt Design

**Prompt:** Design a UX analysis prompt that outputs structured JSON including:

- UX score (1–10)
- Summary
- Issues array (8–12 items)
  - category
  - title
  - description
  - evidence
  - severity
- Before/after recommendations for top issues

**Purpose:** Create consistent, machine-readable LLM output, enable predictable UI rendering, improve reliability of generated insights

---

### 5. User Authentication

**Prompt:** Create login and signup functionality with Express routes and MongoDB user storage.

**Purpose:** Implement authentication flow, build login/signup pages, create User model and secure API routes

---

## Development Notes

- Prompts were refined iteratively based on system responses and output quality
- AI was used to accelerate development, not replace engineering decisions
- All sensitive configuration (API keys, tokens) handled via environment variables
- Groq API selected for performance and developer-friendly integration
- Default model: llama-3.3-70b-versatile
- Fallback model: llama-3.1-70b-versatile

## Role of AI in the Project

AI was used as a development assistant for:

- UI component generation
- API structure suggestions
- prompt engineering
- UX analysis logic design
- debugging and iteration

Final architecture, validation logic, and system decisions were implemented manually.

## Limitations

- AI-generated code required manual validation and testing
- Prompt outputs depend on HTML quality and page structure
- Model responses may vary across different websites
- Some sites restrict automated analysis (HTTP 403)
