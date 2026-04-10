# ZenNote AI Chatbot Setup

## Overview

Added a Gemini-powered AI chatbot that answers questions about your notes with source citations. Each user only sees their own notes (enforced by Clerk auth).

## Architecture

```
User asks question
       │
       ▼
  Frontend (/chat page)
  POST /api/chat { question }
  Authorization: Bearer <clerk-jwt>
       │
       ▼
  Backend (chat.js route)
  requireAuth → extract clerkId
       │
       ▼
  Prisma: fetch user's notes (filtered by clerkId)
       │
       ▼
  RecursiveCharacterTextSplitter → chunk notes (20k chars each, max 3 chunks)
       │
       ▼
  ChatGoogleGenerativeAI (gemini-2.0-flash) → answer with [Source: "Title" (ID: X)] citations
       │
       ▼
  Return { answer: string, sources: [{ id, title, createdAt }] }

```

## Files Changed

### Backend

| File | Change |
|------|--------|
| `backend/package.json` | Added `@langchain/google-genai`, `@langchain/core`, `@langchain/textsplitters` |
| `backend/src/routes/chat.js` | New file — `POST /api/chat` endpoint |
| `backend/src/index.js` | Mounted `chatRoutes` at `/api` (line 108) |
| `backend/.env.example` | Added `GOOGLE_API_KEY` |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/app/chat/page.tsx` | New file — Chat page with message list, source links, loading spinner |
| `frontend/src/components/MenuBody.tsx` | Added "AI Chat" card on home page linking to `/chat` |
| `frontend/src/app/realShowList/page.tsx` | Added `useSearchParams` to support `?noteId=X` auto-selection from chat source links |

## How It Works

### Backend (`backend/src/routes/chat.js`)

1. **Auth**: Protected by `requireAuth` middleware — extracts Clerk `userId` from JWT
2. **Fetch notes**: Queries Prisma for all notes belonging to the authenticated user
3. **Format**: Labels each note with `[Note "Title" (ID: X)]` for citation tracking
4. **Chunk**: Splits notes into max 20k char chunks (with 1k overlap), takes first 3 chunks
5. **Prompt**: System prompt instructs Gemini to only use provided notes and cite sources
6. **Generate**: Calls `gemini-2.0-flash` via LangChain's `ChatGoogleGenerativeAI`
7. **Response**: Returns `{ answer: string, sources: [{ id, title, createdAt }] }`

### Frontend (`frontend/src/app/chat/page.tsx`)

- Dark mode chat interface matching existing NotebookZen style
- User messages on right (purple), AI messages on left (gray)
- Source citations rendered as clickable chips below each AI answer
- Clicking a source navigates to `/realShowList?noteId=X` which auto-selects that note
- Loading state with spinner while Gemini processes

## Setup Steps

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** → create a new key
4. Copy the key

### 2. Add API Key to Backend

```bash
# backend/.env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install @langchain/google-genai @langchain/core @langchain/textsplitters
```

(Already done — dependencies are in `package.json`)

### 4. Start the App

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Use the Chat

1. Go to `http://localhost:3000`
2. Click the **"AI Chat"** card
3. Type a question about your notes
4. AI answers with clickable source links

## API Endpoint

### `POST /api/chat`

**Request:**
```json
{
  "question": "What are my meeting notes about?"
}
```

**Headers:**
```
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json
```

**Response:**
```json
{
  "answer": "Based on your notes, you discussed project planning... [Source: \"Weekly Standup\" (ID: 5)]",
  "sources": [
    { "id": 5, "title": "Weekly Standup", "createdAt": "2026-04-10T..." }
  ]
}
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No vector DB (v1) | Gemini 2.0 Flash has 1M token context — sufficient for most users' note collections |
| `gemini-2.0-flash` model | Free tier available, fast, good quality for Q&A |
| Max 3 chunks | Prevents token overflow while covering recent/relevant notes |
| 20k chunk size | Large enough to keep note context intact |
| Sources as clickable links | Users can jump directly to the referenced note |
| `?noteId=` param approach | Minimal change to existing `realShowList` page |
| No chat history persistence (v1) | Keeps it simple; can add `ChatMessage` model later |
