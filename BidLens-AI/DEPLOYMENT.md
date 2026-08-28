# BidLens AI — Deployment Guide

## Architecture

| Layer | Tech | Deployed On |
|---|---|---|
| Frontend | Next.js 14 | **Vercel** (Free) |
| Backend API | FastAPI (Python) | **Render.com** (Free) |
| Database | In-memory (sessions) | N/A |

---

## Step 1: Deploy the Backend on Render.com

### 1.1 Create a Render account
Go to **[render.com](https://render.com)** → Sign in with GitHub.

### 1.2 Create a New Web Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repo: `aryab4214/BidLens-AI`
3. Set the **Branch** to `MyBid`

### 1.3 Configure the Service Settings

| Field | Value |
|---|---|
| **Name** | `bidlens-backend` |
| **Root Directory** | `BidLens-AI/backend` |
| **Language** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free (or Starter for better performance) |

### 1.4 Environment Variables on Render
Click **"Environment"** tab and add:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (fill in after Vercel step) |

### 1.5 Deploy
Click **"Create Web Service"**.

Render will install all Python packages and start the server.
Your backend URL will look like: `https://bidlens-backend.onrender.com`

**Test it:** Visit `https://bidlens-backend.onrender.com/docs` to confirm it's live.

> **Note:** On the Free tier, Render spins the service down after 15 minutes of inactivity. The first request after that takes ~30 seconds to wake up. This is normal on the free tier.

---

## Step 2: Deploy the Frontend on Vercel

### 2.1 Create a Vercel account
Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub.

### 2.2 Import Project
1. Click **"Add New Project"**
2. Import from GitHub: `aryab4214/BidLens-AI`
3. Set **Root Directory** to `BidLens-AI/frontend`
4. Vercel will auto-detect Next.js

### 2.3 Add Environment Variable
In the Vercel project settings before deploying, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `https://bidlens-backend.onrender.com` |

### 2.4 Deploy
Click **"Deploy"**. Your frontend will be live at:
`https://bidlens-ai.vercel.app` (or similar)

---

## Step 3: Link Everything Together

1. Copy your **Vercel app URL** (e.g., `https://bidlens-ai.vercel.app`)
2. Go to Render dashboard → Your backend service → **Environment**
3. Set `ALLOWED_ORIGINS` = `https://bidlens-ai.vercel.app`
4. Click **"Save Changes"** — Render will automatically redeploy

---

## After Deployment — Running Locally Still Works
Nothing changes for local development. Your terminal commands stay the same:

**Backend:**
```bash
cd BidLens-AI/BidLens-AI/backend
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd BidLens-AI/BidLens-AI/frontend
npm run dev
```

The `NEXT_PUBLIC_BACKEND_URL` variable defaults to `http://localhost:8000` locally if not set.

---

## Important Limitations of Free Tier

| Issue | Free Tier Behavior | Solution |
|---|---|---|
| Backend sleeps after 15 min idle | First request is slow (~30s) | Upgrade to Render Starter ($7/mo) |
| `rapidocr` is heavy (~200MB) | May hit Render's 512MB RAM limit | Upgrade to Standard RAM |
| File uploads are ephemeral | Uploaded docs are lost on restart | Add cloud storage (e.g., S3) |

For the SIH **demo/presentation**, the free tier is perfectly fine.
