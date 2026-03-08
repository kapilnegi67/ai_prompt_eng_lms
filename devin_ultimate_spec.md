# Prompt Engineering Interactive Learning Platform
## Ultimate Development Specification

Author: Kapil Kumar Negi  
Product Type: AI Learning Platform  
Goal: Build a web-based interactive learning system for Prompt Engineering.

---

# 1. Product Vision

Develop a **web-based interactive AI learning platform** that teaches prompt engineering through:

• interactive videos  
• AI prompt playground  
• guided practice  
• AI feedback  
• labs and assignments  
• credit-based academic tracking  

The platform supports a **24-credit minor degree program**.

The system should be deployable for:

• universities  
• online education platforms  
• independent learners

---

# 2. Product Objectives

The platform should allow students to:

1. Learn prompt engineering through interactive lessons
2. Practice prompt writing
3. Receive automated AI feedback
4. Solve real-world problems
5. Complete labs and assignments
6. Track progress toward a **24-credit minor degree**

---

# 3. Academic Program Structure

The system supports a **24-credit minor degree**.

### Credit Definition

1 credit =

15 hours labs or assignments  
30 hours self engagement

Total hours per credit = 45 hours

---

### Course Baskets

The program has 3 baskets.

Basket 1  
Basic Prompt Engineering  
Credits: 8

Basket 2  
Intermediate Prompt Engineering  
Credits: 8

Basket 3  
Advanced Prompt Engineering  
Credits: 8

Total Credits = 24

---

### Course Hierarchy

Minor Degree  
Semester  
Basket  
Module  
Lesson  

---

# 4. Core Platform Modules

The system consists of the following modules.

1. Student Learning Portal  
2. Admin Portal  
3. Prompt Playground  
4. AI Prompt Evaluation Engine  
5. AI Tutor  
6. Assignment and Lab System  
7. Credit Tracking System  
8. Analytics Dashboard

---

# 5. Technology Stack

Frontend

Next.js  
React  
TailwindCSS  
TypeScript

Backend

Python  
FastAPI

Database

PostgreSQL

Authentication

JWT or Supabase Auth

AI Integration

OpenAI API

Optional AI Tools

LangChain

Deployment

Docker  
Docker Compose

Hosting

Frontend: Vercel  
Backend: Railway / Render

---

# 6. System Architecture

High level architecture:

Frontend Web App

↓

Backend API (FastAPI)

↓

Database (PostgreSQL)

↓

AI Service (OpenAI)

---

### Microservices

Frontend Service

Backend API

AI Evaluation Service

Database

---

# 7. Student Portal

Students should be able to:

Signup

Login

View dashboard

Browse baskets

Watch lessons

Solve prompt exercises

Submit labs

Track credits

View certificates

---

# 8. Admin Portal

Admin must be able to:

Create baskets

Create modules

Create lessons

Upload videos

Create labs

Create assignments

Track students

Export reports

---

# 9. Prompt Playground

The prompt playground is the most important feature.

Students must be able to:

Write prompts

Send prompts to AI

View AI response

Receive prompt evaluation

Receive suggestions

Retry improved prompts

---

### Playground Inputs

Prompt text

Task description

Expected output format

---

### Playground Output

AI generated result

Prompt score

Feedback

Improved prompt

---

### Example Output

{
score: 8,
feedback: "Prompt is clear but lacks output formatting.",
improved_prompt: "Generate a structured JSON response..."
}

---

# 10. Prompt Evaluation Engine

Create a backend service that evaluates prompts.

Evaluation criteria:

Clarity

Specificity

Structure

Output control

Context usage

Reasoning guidance

Safety

Score each dimension from 1 to 10.

Generate final score.

Return improvement suggestions.

---

# 11. AI Tutor

Implement an AI tutor that helps students.

Capabilities:

Explain concepts

Suggest better prompts

Provide hints for assignments

Answer questions

The tutor should use:

course content  
lesson transcripts  
prompt examples

---

# 12. Lesson System

Each lesson contains:

Video

Transcript

Notes

Practice exercise

Quiz

Prompt playground

---

### Lesson Page Layout

Video player

↓

Lesson content

↓

Practice prompt

↓

Prompt playground

↓

Quiz

---

# 13. Practice System

Create guided prompt exercises.

Examples:

Summarization prompt

Extraction prompt

Classification prompt

Code generation prompt

Workflow prompts

---

# 14. Lab System

Labs simulate real-world problems.

Example labs:

Build a chatbot prompt

Create structured JSON extraction

Design multi-step prompt chain

Build AI assistant workflow

---

# 15. Assignment System

Assignments must include:

Prompt design task

Output generation

Explanation of approach

Evaluation rubric

---

# 16. Credit Tracking

Track:

Lesson completion

Practice time

Lab completion

Assignment completion

Convert hours into credits.

Display:

credits earned

credits remaining

basket completion

---

# 17. Database Schema

Create tables:

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

AIResponses

Progress

Credits

Certificates

---

# 18. API Endpoints

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

Progress

GET /progress/{user_id}

Admin

POST /admin/basket

POST /admin/module

POST /admin/lesson

POST /admin/lab

POST /admin/assignment

---

# 19. UI Wireframes

### Student Dashboard

Sections:

Current courses

Lessons in progress

Credits earned

Recommended tasks

---

### Lesson Page

Video player

Lesson content

Practice section

Prompt playground

Quiz

---

### Prompt Playground

Prompt editor

Run button

AI output panel

Prompt score

Improvement suggestions

---

# 20. Analytics Dashboard

Admins should see:

Student activity

Completion rates

Average scores

Prompt attempts

Course engagement

---

# 21. Folder Structure

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

# 22. Seed Data

Create a sample basket.

Basic Prompt Engineering

Modules:

Introduction to LLMs

Prompt Fundamentals

Few-shot Prompting

Prompt Optimization

Each module must contain multiple lessons.

---

# 23. Deployment

The platform must run locally.

Command:

docker-compose up

Frontend

npm install

npm run dev

Backend

uvicorn main:app

---

# 24. Deliverables

Complete codebase

Docker configuration

Database schema

Seed data

Setup documentation

API documentation

---

# 25. Testing

Verify:

Login works

Lessons load

Prompt playground works

AI evaluation works

Assignments work

Progress tracking works

---

# 26. Final Objective

Deliver a **fully working MVP of the Prompt Engineering Learning Platform** that can run locally using Docker.

The system must be usable immediately after setup.
