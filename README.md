# SmartNotes AI 🧠

A full-stack AI-powered notes application built with FastAPI, PostgreSQL, and React.

## Features
- 📝 Create, edit, and delete notes
- 🔍 Real-time search across all notes
- ⭐ Favourite notes for quick access
- 🗑️ Trash with restore and empty functionality
- ✨ AI-powered note summarization using Groq LLM

## Tech Stack
*Backend*
- Python + FastAPI
- PostgreSQL + psycopg2
- Groq API (llama-3.3-70b-versatile)

*Frontend*
- React 18 + Vite
- TailwindCSS
- Web Fetch API

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Groq API key

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn psycopg2 groq pydantic
uvicorn main:app --reload