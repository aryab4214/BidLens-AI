# BidLens AI 🔍
**AI-Powered GeM Bid Compliance Verification Platform**  
Smart India Hackathon 2026 | Problem ID: SIH26100

---

## What is BidLens AI?
An intelligent procurement co-pilot that automatically audits Government e-Marketplace (GeM) bid proposals — verifying compliance, detecting cross-document contradictions, scoring rejection risks, and spotlighting hidden value-for-money advantages from smaller MSME vendors.

## Team HexaCore
6-member CSE team | 2nd Year | SIH 2026

## Architecture (Teacher-Validated 6-Layer Stack)
```
Next.js UI → FastAPI Backend → Audit Orchestrator
  ├── AI Processing (OCR + NLP + LLM)
  ├── Compliance Rule Engine (GFR 2017)
  └── Govt Verification (GSTN + MCA)
→ Evidence + Risk Engine (Knowledge Graph + Contradiction Detector)
→ Officer Review (Evidence + Override + Audit Log)
→ Data Layer (PostgreSQL + pgvector + Neo4j + Object Storage)
```

## Tech Stack
- **Frontend:** Next.js + React + TailwindCSS
- **Backend:** Python FastAPI
- **AI/ML:** PyMuPDF, EasyOCR, spaCy, Ollama Mistral-7B
- **Graph DB:** Neo4j / NetworkX
- **Database:** PostgreSQL + pgvector
- **Security:** SHA-256 fingerprinting, prompt injection sanitizer

## Quick Start (Development)
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Or double-click `Start_BidLens.bat` to launch everything at once.

## API Documentation
Once backend is running: http://localhost:8000/docs

## Work Division
| Person | Owns |
|:---|:---|
| **Person 1 (You)** | frontend/ + backend/routers/ + backend/models/ + backend/security/ |
| **Person 2 (Teammate)** | backend/orchestrator/ + backend/evidence_risk/ + data/ |
