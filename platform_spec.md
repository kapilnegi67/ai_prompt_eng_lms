# Interactive Prompt Engineering Learning Platform
## MVP Development Specification

## 1. Overview

Build a web-based interactive learning system for teaching Prompt Engineering.

The platform supports a **24-credit minor degree program** and allows students to:

- Watch interactive video lessons
- Practice prompt engineering
- Solve guided problems
- Receive AI feedback
- Submit assignments
- Track academic credits

The system should include both:

- Student learning interface
- Admin course management interface

The output should be a **fully working MVP** that can run locally.

---

# 2. Technology Stack

Frontend
- Next.js
- React
- TailwindCSS

Backend
- Python FastAPI

Database
- PostgreSQL

Authentication
- JWT or Supabase Auth

AI Integration
- OpenAI API

Deployment
- Docker
- Docker Compose

---

# 3. Core Features

## Student Features

Students must be able to:

- Sign up
- Log in
- View course dashboard
- Browse baskets and modules
- Watch video lessons
- Use prompt playground
- Submit assignments
- Track credits

---

## Admin Features

Admins must be able to:

- Create baskets
- Create modules
- Create lessons
- Upload videos
- Create labs
- Create assignments
- View students
- Track student progress

---

# 4. Academic Structure

The platform should support a **24-credit minor degree program**.

Credit rules:

1 credit equals:

15 hours lab/assignment  
30 hours self engagement

Total credits:

24 credits

---

## Course Baskets

The course consists of 3 baskets:

1. Basic Prompt Engineering (8 credits)
2. Intermediate Prompt Engineering (8 credits)
3. Advanced Prompt Engineering (8 credits)

---

## Course Hierarchy

Minor Degree  
Semester  
Basket  
Module  
Lesson  

---

# 5. Prompt Playground

The prompt playground must allow students to:

Input:

- Prompt text
- Task description
- Expected output format

System should:

1. Send prompt to OpenAI
2. Generate AI response
3. Evaluate prompt quality
4. Provide improvement suggestions

---

## Prompt Evaluation Rubric

Evaluate prompts based on:

- clarity
- specificity
- structure
- output control

Return:

{
  score: number,
  feedback: string,
  improved_prompt: string
}

---

# 6. Pages

## Student Pages

/login  
/signup  
/dashboard  
/baskets  
/baskets/{id}  
/modules/{id}  
/lessons/{id}  
/labs/{id}  
/assignments/{id}  
/prompt-playground  
/progress  

---

## Admin Pages

/admin  
/admin/baskets  
/admin/modules  
/admin/lessons  
/admin/labs  
/admin/assignments  
/admin/students  

---

# 7. Database Tables

Create tables for:

Users  
Roles  
Baskets  
Modules  
Lessons  
Videos  
Labs  
Assignments  
Submissions  
PromptAttempts  
Progress  
Credits  

---

# 8. API Endpoints

Authentication

POST /auth/signup  
POST /auth/login  

Courses

GET /baskets  
GET /modules/{id}  
GET /lessons/{id}  

Prompt Playground

POST /prompt/evaluate  

Assignments

POST /assignment/submit  
GET /assignment/{id}  

Progress

GET /progress/{user_id}  

Admin

POST /admin/basket  
POST /admin/module  
POST /admin/lesson  
POST /admin/lab  
POST /admin/assignment  

---

# 9. UI Layout

Student Dashboard must show:

- Enrolled baskets
- Lessons in progress
- Credits earned
- Recommended lessons

---

## Lesson Page Layout

Video player

Lesson content

Practice exercises

Prompt playground

Quiz

---

# 10. Folder Structure

Frontend

frontend/
  app/
  components/
  services/
  styles/

Backend

backend/
  app/
    api/
    models/
    schemas/
    services/
    db/

---

# 11. Seed Data

Create sample course content.

Basket:

Basic Prompt Engineering

Modules:

Introduction to LLMs  
Prompt Fundamentals  
Few-shot Prompting  
Prompt Optimization  

Each module should contain multiple lessons.

---

# 12. Deployment

Provide instructions for running locally.

Use:

docker-compose up

Frontend:

npm install
npm run dev

Backend:

uvicorn main:app

Include environment variables.

---

# 13. Quality Requirements

Ensure:

- clean architecture
- modular code
- error handling
- API documentation
- comments

Include a README.md.

---

# 14. Deliverables

The system must include:

- complete source code
- docker configuration
- database schema
- seed data
- setup documentation

---

# 15. Final Requirement

Once complete:

Run the system locally.

Verify:

- login works
- lessons load
- prompt playground works
- AI evaluation works
- assignments work
- progress tracking works

The system should be usable immediately after setup.
