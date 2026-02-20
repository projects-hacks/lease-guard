# LeaseGuard - AI Tenant Protection Platform

**LeaseGuard** is an AI-powered platform designed to protect tenants from unfair leases, stolen deposits, and overpriced rent. Built for the DeveloperWeek 2026 Hackathon using cutting-edge technologies.

## 🚀 Features

### 1. Legal Shield (Lease Analysis)

- **Problem**: Leases are long, complex, and full of illegal clauses.
- **Solution**: Upload your PDF lease. GPT-4o analyzes every clause, highlighting red flags and illegal terms based on state laws.
- **Tech**: Foxit PDF Services (Text Extraction), OpenAI GPT-4o (Analysis), Sanity (Storage).

### 2. Deposit Defender (Move-In Inspection)

- **Problem**: Landlords often claim damages that were already there to keep security deposits.
- **Solution**: Record a video walkthrough. Computer Vision extracts key frames, and GPT-4o Vision detects existing defects (scratches, holes, mold). Generates a timestamped, legal-ready Condition Report PDF.
- **Tech**: OpenCV (Frame Extraction), GPT-4o Vision (Defect Detection), Foxit Doc Gen (Report PDF).

### 3. Rent Radar (Market Analysis)

- **Problem**: It's hard to know if you're overpaying.
- **Solution**: Enter your zip code and apartment details. LeaseGuard estimates fair market rent using real-time data and rates your deal (Great/Fair/Overpriced).
- **Tech**: GPT-4o (Market Estimation), External Data APIs.

### 4. Voice Assistant (Legal Q&A)

- **Problem**: Legal questions are urgent and complex.
- **Solution**: Talk to LeaseGuard AI naturally. Ask questions like "Can I be evicted without notice?" and get instant, voice-based answers.
- **Tech**: Deepgram Nova-2 (Speech-to-Text), Deepgram Aura (Text-to-Speech), GPT-4o (Legal Brain).

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI, Lucide React.
- **Backend**: FastAPI (Python), OpenCV, OpenAI SDK, Deepgram SDK.
- **Database**: Sanity.io (Content Lake).
- **Infrastrucutre**: Docker, Kubernetes (Akamai LKE ready).
- **APIs**: OpenAI, Deepgram, Foxit PDF Services.

## 📦 Installation

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- API Keys: OpenAI, Deepgram, Foxit, Sanity Project ID.

### Environment Setup

Create a `.env` file in `backend/` and `frontend/` (or root for docker-compose):

```bash
# backend/.env
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
FOXIT_API_KEY=...
SANITY_PROJECT_ID=...
SANITY_DATASET=production
SANITY_API_TOKEN=...

# frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
```

### Running Locally

1. **Start Backend & Frontend**:

   ```bash
   docker-compose up --build
   ```

2. **Access the App**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

3. **Sanity Studio** (Optional, for content management):

   ```bash
   cd sanity
   npm install && npm run dev
   ```

   Access at [http://localhost:3333](http://localhost:3333).

## 🚢 Deployment

The project includes K8s manifests in `k8s/` for deployment to Akamai Linode Kubernetes Engine (LKE).

```bash
kubectl apply -f k8s/
```

## 📜 License

MIT License.
