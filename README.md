# 📺 VISIOCARE: Multimodal AI Customer Support & Visual Troubleshooting System

VisioCare is a production-grade, full-stack visual diagnostics and customer support platform. It fuses **Vision-Language Model (VLM)** reasoning, real-time computer vision heuristics, optical character recognition (OCR), client device logs, and semantic support indexing to deliver automated customer service.

Unlike basic text chatbots, VisioCare operates as an AI-powered technical helpdesk—visually annotating system screenshots, detecting specific layout anomalies, indexing technical guidelines, and auto-compiling incident manuals to manage customer frustrations.

---

## 🚀 Key Architectural Capabilities

- 👁️ **Visual Troubleshooting Core (VLM)**: Dual-mode orchestration. It processes user screenshots through the Live Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`) or cascades to a high-fidelity **Local CV Simulation Engine** (analyzing image dimensions, aspect ratios, edge density, and dominant colors to map visual bounding boxes).
- 🧬 **Interactive Coordinate Highlights**: The frontend plots VLM-generated visual overlay coordinates (`[y_min, x_min, y_max, x_max]`) into hovering highlighted bounding boxes directly on top of client screenshots.
- 🧠 **Context-Aware Sentiment prioritiers**: Uses natural language parsers to trace caps-shouting, repetition indices, and frustration words. It dynamically scores frustration (0 to 100) to adjust response tones and trigger auto-escalation pathways.
- 🎛️ **Cognitive Agent Reasoning Trail**: Support agents can toggle open a deep "AI Reasoning Trace" terminal in the chat panel, reviewing latency metrics, matched confidence levels, and active thought paths.
- 🔎 **Pure-Python Cosine Vector Similarity**: An offline-ready semantic retrieval engine that indexes structured enterprise articles, calculating cosine values to serve contextual support references.
- 📊 **Real-time Performance Dashboards**: Tracks operational performance (VLM latency, sentiment averages, and error frequency profiles) using streaming Recharts dashboards.

---

## 🗺️ System Architecture Diagram

```mermaid
graph TD
    User([Customer / Engineer]) -->|Upload Screenshot / Console logs| FE[Next.js 15 Frontend]
    FE -->|API Proxy Rewrites / JSON| BE[FastAPI Backend]
    
    subgraph FastAPI Backend (Python 3.10+)
        BE --> API[Router: Auth, Chat, Diagnostics, Tickets, Analytics]
        API --> DB[(SQLite / PostgreSQL DB)]
        
        subgraph VLM Orchestrator & AI layer
            API --> VLM[VLM Router: Gemini API / Smart Fallback CV]
            API --> OCR[OCR Pipeline: Bounding box coords]
            API --> VectorEngine[Semantic Cosine Engine: Support KB Index]
            API --> Emotion[Linguistic sentiment analyzer]
        end
        
        API --> Workflows[Stateful Troubleshooting Graph Nodes]
        API --> Escalation[Automated Ticket Summarizer]
    end
```

---

## 🛠️ Technology Stack

### Frontend Service
- **Next.js 15** (App Router structure)
- **React 19** (Standard components)
- **Zustand** (Unified global actions store)
- **TailwindCSS** (Custom HSL cyberpunk styling tokens & glassmorphic cards)
- **Lucide React** (Vector diagnostic icon sets)
- **Recharts** (Performance dashboards & trends)

### Backend API Service
- **FastAPI** (High-speed asynchronous Python server)
- **SQLAlchemy** (ORM framework mapping model entities)
- **Pydantic** (Payload schemas and type validations)
- **Pillow (PIL)** (Visual feature and dominant color extraction)
- **Google GenerativeAI** (Official Gemini SDK orchestrator)
- **SQLite** (Default plug-and-play local file database)

---

## 📂 Project Directory Structure

```
visiocare/
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entrypoint & table initializations
│   │   ├── core/                # DB Session makers, JWT configurations
│   │   ├── models/              # SQLAlchemy model structures (JSON capabilities)
│   │   ├── schemas/             # Pydantic schemas validating API transactions
│   │   ├── api/                 # Endpoints (Auth, Chat, Diagnostics, Tickets)
│   │   ├── ai/                  # VLM, Emotional analytics, and Troubleshooting Trees
│   │   ├── parsing/             # OCR coordinates mappings
│   │   └── retrieval/           # Custom TF-IDF Vector Similarity Search
│   ├── requirements.txt         # API service packaging details
│   └── Dockerfile               # Container builder
│
├── frontend/
│   ├── app/                 # Next.js App routing screens (Chat, Diagnostics, Tickets)
│   ├── components/          # Sidebar, ChatWorkspace, ScreenshotViewer overlay, Dashboards
│   ├── stores/              # Zustand unified state management
│   ├── tailwind.config.js   # Glassmorphic and gradient tokens
│   ├── next.config.js       # Reverse Proxy rules routing api traffic to backend
│   ├── package.json         # React 19 packages list
│   └── Dockerfile           # Next.js production image creator
│
└── docker-compose.yml       # Links all microservices
```

---

## ⚡ Execution and Local Setup Guide

Follow these steps to run VisioCare locally on your machine.

### 1. Launch backend (FastAPI)
Navigate to the `backend/` directory:
```bash
cd backend
```
Create a virtual environment:
```bash
python -m venv venv
```
Activate it:
- **Windows**: `venv\Scripts\activate`
- **Mac/Linux**: `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

*(Optional)* Configure your Live Gemini API Key:
Set the environment variable:
- **Windows (PowerShell)**: `$env:GEMINI_API_KEY="your-gemini-api-key"`
- **Linux/Mac**: `export GEMINI_API_KEY="your-gemini-api-key"`

Start the API server:
```bash
uvicorn backend.app.main:app --reload --port 8000
```
- API Documentation is now available at: `http://localhost:8000/docs`
- On startup, the system automatically instantiates a local database `visiocare.db` and pre-seeds it with demo accounts and articles.

---

### 2. Launch frontend (Next.js 15)
Navigate to the `frontend/` directory in a new terminal:
```bash
cd frontend
```
Install packages:
```bash
npm install
```
Start the local development server:
```bash
npm run dev
```
Open your browser to: `http://localhost:3000`

---

## 🔑 Demo Account Credentials
- **Technical Support Agent**: `agent@visiocare.com` | Password: `visiocareagent123`
- **Standard Customer**: `customer@visiocare.com` | Password: `visiocarecustomer123`

---

## 🐳 Docker Deployment Setup
To build and run all services in a fully-orchestrated environment:
```bash
docker-compose up --build
```
This mounts local folders for active dev syncing, establishes named docker volumes for uploaded screenshot files, and exposes:
- Frontend Client: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🧪 Interactive Diagnostics Guide
To test the visual understanding pipeline out of the box (without API keys):
1. **Payment Timeout Diagnostic**: In the chat panel, upload a screenshot or type `"payment stripe timeout check"`. The VLM simulator automatically extracts coordinates mapping absolute Stripe timeout modals, highlighting disabled submit buttons, and laying out recovery action nodes.
2. **Container OOM Check**: Send a message containing `"docker exit code 137"` to trigger a Memory Limit escalation ticket.
3. **Network Conflict Check**: Go to the **Device Diagnostics** page, input a CLI collision conflict dump, and trigger auto-diagnostics to print lease renewing guides.
