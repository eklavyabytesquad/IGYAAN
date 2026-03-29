# IGYAN.AI — AI-Powered Educational Operating System

> Ethical, teacher-centric AI platform aligned with NEP 2020. A unified operating system for schools, educators, students, parents, and aspiring entrepreneurs.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Platform Suites](#platform-suites)
- [User Roles](#user-roles)
- [Public Pages](#public-pages)
- [Dashboard Pages & Features](#dashboard-pages--features)
  - [AI Products](#1-ai-products)
  - [AI Tools Suite](#2-ai-tools-suite)
  - [Assessment & Assignments](#3-assessment--assignments)
  - [School Management & Operations](#4-school-management--operations)
  - [Report Cards & Analytics](#5-report-cards--analytics)
  - [Communication & Collaboration](#6-communication--collaboration)
  - [Events Management](#7-events-management)
  - [Incubation & Entrepreneurship](#8-incubation--entrepreneurship)
  - [Courses & Learning Paths](#9-courses--learning-paths)
  - [Counselor Portal](#10-counselor-portal)
  - [Parent Portal](#11-parent-portal)
  - [User Access & Settings](#12-user-access--settings)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)

---

## Overview

IGYAN.AI is a comprehensive **AI-powered school management and learning platform** that provides:

- Unified operating system for schools
- Sudarshan AI copilots for every learner and educator
- Career and venture incubators built-in
- 5 major AI products, 8 individual AI tools, 30+ dashboard modules
- 8 role-based portals with granular access control
- Multi-language support (English & Hindi)

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js (App Router)                |
| Language     | JavaScript (ES6+)                   |
| Styling      | Tailwind CSS                        |
| Backend/Auth | Supabase (PostgreSQL, Auth, RLS)    |
| AI Engine    | OpenAI GPT-4o                       |
| Voice        | Web Speech API                      |
| Video        | igyan-meets (embedded conferencing) |
| Icons        | Lucide React                        |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Platform Suites

| Suite                            | Target Audience                           | Registration Route            |
| -------------------------------- | ----------------------------------------- | ----------------------------- |
| **Institutional Suite**          | Schools — admins, faculty, students, parents, counselors | `/register/institutional-suite` |
| **Professional Suite (Launch Pad)** | B2C students & mentors (entrepreneurship) | `/register/launch-pad`        |

---

## User Roles

| Role         | Portal Name      | Description                    |
| ------------ | ---------------- | ------------------------------ |
| Super Admin  | Admin Portal     | Full system control            |
| Co-Admin     | Admin Portal     | School management              |
| Faculty      | Faculty Portal   | Teaching & assessment          |
| Student      | Student Portal   | Learning & innovation hub      |
| Counselor    | Counselor Portal | Well-being & guidance          |
| Parent       | Parent Portal    | Track & connect                |
| B2C Student  | Launch Pad       | Build · Pitch · Launch         |
| B2C Mentor   | Mentor Console   | Guide · Review · Impact        |

---

## Public Pages

| Route          | Page              | Description                                                                 |
| -------------- | ----------------- | --------------------------------------------------------------------------- |
| `/`            | **Landing Page**  | Hero section, feature cards, stats, Sudarshan AI copilot overview, offering comparison matrix (Institutional vs Professional Suite), media coverage carousel |
| `/about`       | **About**         | Dynamic content — values, problem statements, team info, media carousel     |
| `/features`    | **Features**      | Feature groups, Academic Intelligence, Smart Admin, Automations, Governance sections (CMS-driven from Supabase) |
| `/contact`     | **Contact**       | Contact form and company information                                        |
| `/insights`    | **Insights/Blogs**| Blog listing with tag-based filtering and featured articles                 |
| `/insights/[slug]` | **Blog Post** | Individual blog article page                                                |
| `/insights/blogs`  | **Blog Management** | Blog content management                                                |
| `/insights/industry`| **Industry Insights** | Curated industry articles and analysis                              |
| `/shark-ai`   | **AI Shark Landing** | Public-facing AI Shark pitch simulator page with investor-matching positioning |
| `/login`       | **Login**         | Authentication page with suite selection (Institutional / Launch Pad)       |
| `/register`    | **Registration**  | New user registration with suite routing                                    |
| `/mycourses`   | **My Courses**    | User's enrolled courses view                                                |
| `/assignments` | **Assignments**   | Public assignments page                                                     |
| `/performance` | **Performance**   | Public performance overview                                                 |
| `/messages`    | **Messages**      | Messaging interface                                                         |

---

## Dashboard Pages & Features

All dashboard pages live under `/dashboard` and are protected by role-based authentication.

---

### 1. AI Products

#### `/dashboard/sudarshan` — Sudarshan AI (Personal Copilot)
- Multi-mode AI chatbot powered by **OpenAI GPT-4o**
- **6 operational modes:** Doubt Solver, Homework Helper, Concept Explainer, Test Prep, Study Buddy, and more
- **Student-profile aware** — personalizes responses based on class, interests, learning style, strengths, and goals
- Chat history persistence with session and overall memory
- **Voice input** via Web Speech API
- **Notes selector** — upload personal notes for contextual tutoring
- Markdown-rendered responses

#### `/dashboard/copilot-faculty` — Faculty Copilot
- Faculty-specific variant of Sudarshan AI
- Teaching-focused modes with faculty profile integration
- Lesson plan assistance, content generation, and classroom strategy support

#### `/dashboard/viva-ai` — Viva Intelligence (AI Viva)
- **Voice-first** AI viva/oral examination preparation tool
- Text + voice input modes (speech-to-text and text-to-speech)
- Student profile integration for personalized questions
- Quiz mode with auto-generated questions
- **Report generation** with performance analysis
- Chat history saved to Supabase

#### `/dashboard/shark-ai` — AI Shark (Pitch Simulator)
- **Business pitch evaluation engine** — simulates a panel of investors
- Upload a business plan PDF → AI reviews it → timed **5-minute pitch session**
- Voice + text pitch input with real-time transcription
- Performance analytics and scoring across: **Clarity, Business Model, Market Analysis, Financials, Communication**
- Multi-language support (English & Hindi)
- Pitch warning modal and countdown timer

#### `/dashboard/gyanisage` — Buddy AI / GyanAI Sage (Counsellor AI)
- AI counselling chatbot with **4 modes:**
  - **Life Counselling** — emotional support, stress management, well-being
  - **Career Roadmap** — career path planning, skills development
  - **Academic Growth** — study strategies, exam preparation, goal setting
  - **Personal Development** — leadership, communication, financial literacy
- Different branding per user type: **Buddy AI** (institutional) / **GyanAI Sage** (B2C)

#### `/dashboard/content-generator` — Slide's Creator / DeckMaster
- AI-powered presentation and document generator
- **3 output types:**
  - **PPT** — standard educational presentations with template selection
  - **PDF** — formatted document generation with templates
  - **Shark PPT** — investor pitch deck generator (Indian ₹ context, 5-slide structure)
- Live preview, per-slide editing, fullscreen mode
- Download as PowerPoint or PDF

---

### 2. AI Tools Suite

#### `/dashboard/tools` — Individual AI Tools

| Tool                        | Student Label   | Description                                                                             |
| --------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| **Startup Idea Generator**  | Idea Spark      | Generate startup ideas based on interests, industry, budget, and timeframe using GPT-4o |
| **Smart Notes Generator**   | NoteGen AI      | Transform topics/lectures into structured study notes                                   |
| **Text Summarizer**         | QuickRead       | Condense articles and documents into concise summaries                                  |
| **Step-by-Step Guide**      | —               | Generate actionable walkthroughs with milestones and tips                               |
| **Project-Based Learning**  | Launch Project  | Personalized project recommendations based on learning goals                            |
| **Quiz Me**                 | BrainFlex       | AI-generated quizzes with instant feedback and explanations                             |
| **Code Tutor**              | —               | Interactive coding assistant supporting **14 languages** (JS, Python, Java, C++, Rust, Go, etc.) |
| **Teacher Prep**            | —               | Faculty quiz generator for knowledge testing, teaching strategies, classroom scenarios  |

---

### 3. Assessment & Assignments

#### `/dashboard/assignments` — AI Question Builder
- CBSE-aligned question generation by class, subject, and topic
- Custom question count and difficulty levels (Easy / Medium / Hard)
- Mixed question types: **MCQ, Short Answer, Long Answer, Higher-Order Thinking (HOT)**
- Question ordering: conceptual, application, analytical, or mixed
- Copy to clipboard & PDF export with MCQ formatting

#### `/dashboard/question-paper` — Question Paper Generator (Teachers Toolkit)
- Full CBSE question paper generation with sections (VSA, SA, LA)
- Configure exam duration and total marks
- **Two modes:** New (from curriculum) or Old Data (regenerate from existing papers)
- PDF generation with proper formatting and marks allocation

#### `/dashboard/homework` — Homework Management
- Create and manage homework assignments (MCQ + Viva types)
- AI-powered question generation with **Bloom's taxonomy** levels
- Deadline and max marks configuration
- Student submission tracking
- Subject, class, and difficulty filtering

#### `/dashboard/gamified-assignments` — Gamified Assignments *(Coming Soon)*
- Achievement system with badges and trophies
- Game-based assessments and rewards
- Timed challenges and leaderboards

#### `/dashboard/gamified` — Gamified Learning
- Gamification layer for learning activities

---

### 4. School Management & Operations

#### `/dashboard/school-management` — School Management Hub
Complete school operations center with **10 management tabs:**

| Tab                  | Features                                                   |
| -------------------- | ---------------------------------------------------------- |
| Academic Sessions    | Create and manage school years                             |
| Subjects             | CRUD for school subjects                                   |
| Classes              | Manage classes with sections                               |
| Add Students         | Individual + bulk CSV import                               |
| Students             | View and manage enrolled students                          |
| Faculty Assignment   | Assign teachers to classes and subjects                    |
| Student Attendance   | Mark and track student attendance                          |
| Faculty Attendance   | Mark and track faculty attendance                          |
| Transfers            | Student transfer management                                |
| Parents              | Manage parent accounts and linkages                        |

#### `/dashboard/student-management` — Student Management
- Add students individually or via **bulk CSV upload**
- Detailed student profiles: learning style, interests, strengths, growth areas, academic goals, house, roll number
- Search and filter by class
- View, edit, and manage student records

#### `/dashboard/attendance` — Attendance System
- Mark attendance by class and date (present / absent / late toggle)
- "Mark all present" shortcut
- View mode with attendance history
- Stats dashboard
- Separate faculty and student attendance
- Parent visibility for child attendance

#### `/dashboard/timetable` — Timetable Builder
- Full timetable builder with day/slot configuration
- Slot types: **Period, Short Break, Lunch Break**
- Subject-color coded display
- Faculty assignment per period
- Template-based saving (multiple timetable templates)
- Configurable school start time and active days (Mon–Sat)

#### `/dashboard/faculty-substitution` — Smart Substitution
- AI-powered substitute teacher matching algorithm
- Considers: **subject expertise, workload, and availability**
- Calendar view of absences
- Substitution history tracking
- OpenAI-powered reasoning for substitution decisions
- Notification system for substitute teachers

#### `/dashboard/school-profile` — School Profile
- Complete school registration form (name, type, board, address, UDISE code)
- Principal details
- Document upload: logo, registration certificate, affiliation certificate, principal ID proof

---

### 5. Report Cards & Analytics

#### `/dashboard/report-cards` — Report Card Generator
- Exam creation: Quarterly, Half-Yearly, Annual, Unit Tests
- CBSE grading system support
- Marks entry by class, subject, and student
- Bulk upload option
- **PDF report card generation** with school branding
- Multi-exam support per academic year

#### `/dashboard/reports` — Smart Report Builder
- AI-powered analytics dashboard
- Class-level and individual student performance reports
- Stats: total students, average score, active courses, top performers
- Downloadable report generation

#### `/dashboard/performance` — Performance & Analytics
- Performance tracking dashboard
- Trend analysis with progression metrics
- Role-adaptive labels (students, mentors, parents)

---

### 6. Communication & Collaboration

#### `/dashboard/live-classroom` — Omni Sight (Live Classroom)
- Built-in video conferencing powered by **igyan-meets**
- Embedded iframe-based meeting rooms
- Create/join rooms with URL-based sharing
- Camera, microphone, and screen sharing support
- Role-restricted access

#### `/dashboard/faculty-chat` — Faculty–Parent Chat
- Class teacher → parent messaging system
- Conversation threads per parent-student pair
- Message flags: general, urgent, academic, behavioral
- Unread message tracking
- Search and filter capabilities

#### `/dashboard/messages` — B2C Messaging (Mentors ↔ Students)
- Mentor-student connection system
- Session request/approval workflow
- Profile-enriched user directory
- Request panels for mentors and students

---

### 7. Events Management

#### `/dashboard/events` — Events System
- Create and edit school events (academic, cultural, sports, etc.)
- Event registration with participant tracking
- Public vs. private events
- Banner images, location, date/time, max participants
- Registration deadline management
- **CSV export** of registrations
- Three views: Admin Management, Student Browse, Public Events

---

### 8. Incubation & Entrepreneurship

#### `/dashboard/incubation-hub` — Incubation Hub / Startup Hub
- Comprehensive directory of **20+ Indian government startup incubators**
- Categorized by state and national programs
- Links to: Startup India, Atal Innovation Mission, MSME, MeitY, STPI, NIDHI, and more
- Searchable and filterable by region
- Separate view for B2C students (Startup Hub) and B2C mentors (Validation Desk)

#### `/dashboard/startup help` — Startup Help
- Resources and guidance for entrepreneurial journeys
- Hub for startup-related tools and information

---

### 9. Courses & Learning Paths

#### `/dashboard/courses` — Courses / SkillTracks
- Pre-built course library with multilingual support (English + Hindi)
- **Course categories:** Foundation, Technology, Entrepreneurship, Career Development
- Available courses:
  - **Base Layer** — life skills, financial literacy, decision-making
  - **Everyday Tech** — digital literacy
  - **Hustle and Earn** — freelancing, monetization
  - **Professional Edge** — communication, networking, resume building
- Each course includes: **Main Content PDF, Mind Map PDF, Video Course**

---

### 10. Counselor Portal

#### `/dashboard/counselor` — AI Safety & Counseling
- **AI Safety Alerts System** — active alerts dashboard
- Risk tickets management
- Alert history tracking
- Active counseling session management
- Student directory
- AI chat history monitoring
- Session notes documentation

---

### 11. Parent Portal

#### `/dashboard/parent` — Parent Dashboard

| Feature              | Description                                      |
| -------------------- | ------------------------------------------------ |
| My Children          | View linked children's profiles                  |
| Attendance Tracking  | Today's status, absence alerts, weekly reports   |
| Report Cards         | View academic reports                            |
| Homework Tracking    | Monitor pending homework                         |
| Performance Overview | Track child's academic progress                  |
| Class Teacher Chat   | Direct messaging with teachers                   |
| School Events        | Browse upcoming events                           |

---

### 12. User Access & Settings

#### `/dashboard/users` — User Management
- Add new users (faculty, students, co-admins)
- Faculty profile modal with detailed fields (department, qualifications, employment type)
- WhatsApp onboarding notifications
- Profile image upload

#### `/dashboard/user-access` — User Access & Roles
- Granular **module-level access control** per user
- 14+ modules with configurable access: full / read-only / none
- Super admin exclusive feature

#### `/dashboard/settings` — Dashboard Settings
- **5 theme options:** Aurora Indigo, Verdant Emerald, Celestial Ocean, Sunset Ember, Midnight Neon
- Live preview and persistent selection

#### `/dashboard/profile` — Profile Management
- User profile editing
- School data integration

#### `/dashboard/about` — Dashboard About
- Platform information and version details

---

## API Routes

| Route                    | Method | Description                                        |
| ------------------------ | ------ | -------------------------------------------------- |
| `/api/shark-ai`          | POST   | Proxy for AI Shark business pitch evaluation       |
| `/api/shark-ai-chat`     | POST   | Shark AI chat endpoint                             |
| `/api/extract-pdf`       | POST   | PDF content extraction for document analysis       |
| `/api/generate-questions` | POST  | AI question paper generation                       |
| `/api/openai-reasoning`  | POST   | Faculty substitution AI reasoning                  |
| `/api/voice-chat`        | *      | Voice chat history CRUD (Supabase)                 |
| `/api/blogs`             | *      | Blog content management                            |
| `/api/otp`               | POST   | OTP-based authentication                           |
| `/api/student-profile`   | *      | Student profile management                         |
| `/api/notifications`     | *      | Notification system                                |

---

## Database Schema

Schema files are located in `/schema/`:

| File                             | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `blogs.sql`                      | Blog/insights content tables               |
| `dynamic_content.sql`            | CMS-driven dynamic page content            |
| `otp_records.sql`                | OTP verification records                   |
| `parent_student_assignments.sql` | Parent ↔ student relationship mapping      |
| `parent_teacher_messages.sql`    | Faculty ↔ parent chat messages             |
| `school_management_tables.sql`   | Core school management tables              |
| `timetable_tables.sql`           | Timetable and scheduling tables            |
| `fix_faculty_profiles_pk.sql`    | Faculty profiles primary key fix migration |
| `fix_rls_policies.sql`           | Row-Level Security policy fixes            |

---

## Project Structure

```
igyan-mvp/
├── public/asset/              # Static assets (AI Shark, Sudarshan AI images)
├── schema/                    # SQL schema files for Supabase
├── src/
│   ├── app/
│   │   ├── page.js            # Landing page
│   │   ├── layout.js          # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── about/             # About page
│   │   ├── api/               # API routes (10 endpoints)
│   │   ├── contact/           # Contact page
│   │   ├── dashboard/         # Protected dashboard (30+ modules)
│   │   ├── features/          # Features page
│   │   ├── insights/          # Blog/insights pages
│   │   ├── login/             # Authentication (Institutional + Launch Pad)
│   │   ├── register/          # Registration (Institutional + Launch Pad)
│   │   ├── shark-ai/          # Public AI Shark page
│   │   └── utils/             # Auth context, Supabase client, access control
│   └── components/
│       ├── dashboard/         # Dashboard-specific components (sidenav, navbar, etc.)
│       ├── ui/                # Reusable UI components (Card, Button, etc.)
│       ├── navbar.js          # Public navbar
│       ├── footer.js          # Footer
│       ├── logo.js            # Logo component
│       └── theme-provider.js  # Theme context provider
├── package.json
├── next.config.mjs
├── tailwind / postcss config
└── eslint.config.mjs
```

---

## Quick Stats

| Category           | Count   |
| ------------------ | ------- |
| Major AI Products  | **5**   |
| Individual AI Tools| **8**   |
| User Roles         | **8**   |
| Dashboard Modules  | **30+** |
| API Routes         | **10**  |
| Pre-built Courses  | **4+**  |
| Dashboard Themes   | **5**   |
| Languages          | **English, Hindi** |

---

## License

Proprietary — I-GYAN AI. All rights reserved.
