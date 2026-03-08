# Prompt Engineering Interactive Learning Platform

A full-stack learning management system for Prompt Engineering education, featuring AI-powered prompt evaluation, interactive lessons, and a 24-credit minor degree program structure.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Python 3.11
- **AI:** OpenAI GPT integration with mock fallback
- **Infrastructure:** Docker, Docker Compose

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- (Optional) OpenAI API key for real AI evaluation

### Run with Docker

```bash
# Clone the repository
git clone https://github.com/kapilnegi67/ai_prompt_eng_lms.git
cd ai_prompt_eng_lms

# (Optional) Set your OpenAI API key
export OPENAI_API_KEY=your-key-here

# Start all services
docker-compose up --build
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Demo Credentials

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Student | student@prompteng.edu    | student123  |
| Admin   | admin@prompteng.edu      | admin123    |

## Architecture

```
ai_prompt_eng_lms/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/             # Route handlers
│   │   │   ├── auth.py      # Authentication (signup, login, JWT)
│   │   │   ├── courses.py   # Baskets, modules, lessons
│   │   │   ├── playground.py# Prompt evaluation & AI tutor
│   │   │   ├── assignments.py# Labs & assignment submissions
│   │   │   ├── progress.py  # Student progress & credits
│   │   │   └── admin.py     # Admin CRUD & analytics
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # AI evaluation engine
│   │   ├── db/              # Database setup
│   │   ├── config.py        # Environment configuration
│   │   ├── seed.py          # Demo data seeding
│   │   └── main.py          # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── dashboard/       # Student dashboard
│   │   ├── baskets/         # Course baskets & detail
│   │   ├── modules/         # Module detail
│   │   ├── lessons/         # Lesson viewer (video, content, quizzes)
│   │   ├── labs/            # Lab exercises
│   │   ├── assignments/     # Assignment submissions
│   │   ├── prompt-playground/ # Interactive prompt playground
│   │   ├── progress/        # Progress tracking
│   │   └── admin/           # Admin dashboard & CRUD pages
│   ├── components/          # Reusable UI components
│   ├── services/            # API client layer
│   ├── lib/                 # Auth context & utilities
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml       # Multi-service orchestration
```

## Features

### Student Portal
- **Dashboard** with stats (credits earned, hours spent, lessons completed)
- **Course Browser** organized by Baskets > Modules > Lessons
- **Lesson Viewer** with video support, content, exercises, and quizzes
- **Prompt Playground** with AI-powered evaluation across 7 dimensions
- **AI Tutor** for prompt engineering guidance
- **Lab Exercises** with starter prompts and submissions
- **Assignments** with rubrics and submission forms
- **Progress Tracking** toward the 24-credit minor degree

### Admin Portal
- **Analytics Dashboard** (students, submissions, scores)
- **CRUD Management** for baskets, modules, lessons, labs, and assignments
- **Student Tracking** with individual progress views

### AI Evaluation Engine
Prompts are scored on 7 dimensions (each 0-10):
- Clarity, Specificity, Structure, Output Control, Context Usage, Reasoning Guidance, Safety

## Credit System

The platform follows a 24-credit minor degree structure:
- **3 Baskets** (Basic, Intermediate, Advanced) x 8 credits each
- **1 credit = 45 hours** (15 lab + 30 self-study)
- **Total program: 1,080 hours**

## Environment Variables

### Backend
| Variable        | Default                                               | Description          |
|-----------------|-------------------------------------------------------|----------------------|
| DATABASE_URL    | postgresql://postgres:postgres@db:5432/prompt_eng_lms | PostgreSQL connection |
| SECRET_KEY      | change-me-in-production...                            | JWT signing key      |
| OPENAI_API_KEY  | (empty)                                               | OpenAI API key       |
| OPENAI_MODEL    | gpt-3.5-turbo                                         | OpenAI model         |

### Frontend
| Variable             | Default               | Description       |
|----------------------|-----------------------|-------------------|
| NEXT_PUBLIC_API_URL  | http://localhost:8000  | Backend API URL   |

## Development (without Docker)

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL to a local PostgreSQL instance
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /auth/signup              | Create account           |
| POST   | /auth/login               | Login (returns JWT)      |
| GET    | /auth/me                  | Current user info        |
| GET    | /baskets                  | List all baskets         |
| GET    | /baskets/{id}             | Basket detail + modules  |
| GET    | /modules/{id}             | Module detail + lessons  |
| GET    | /lessons/{id}             | Lesson detail + content  |
| POST   | /playground/evaluate      | Evaluate a prompt        |
| POST   | /playground/tutor         | Ask AI tutor             |
| GET    | /labs                     | List labs                |
| GET    | /assignments              | List assignments         |
| POST   | /assignments/submit       | Submit assignment/lab    |
| GET    | /progress/{user_id}       | Student progress         |
| POST   | /progress/update          | Mark lesson complete     |
| GET    | /admin/analytics          | Platform analytics       |
| GET    | /admin/students           | List all students        |
| POST   | /admin/baskets            | Create basket            |
| POST   | /admin/modules            | Create module            |
| POST   | /admin/lessons            | Create lesson            |
