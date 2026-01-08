# AI-Based Confidence Assessment System - Setup Guide

## 🎯 Complete Setup Instructions

### Backend Setup (Flask + Gemini)

1. **Navigate to backend:**
   ```powershell
   cd backend
   ```

2. **Activate virtual environment:**
   ```powershell
   & ..\.venv\Scripts\Activate.ps1
   ```

3. **Verify environment file (`backend/.env`):**
   ```env
   GEMINI_API_KEY=AIzaSyAeM72ESt99G0XWZDBejsGEdjg2hU60m2I
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_API_VERSION=v1beta
   ```

4. **Start backend server:**
   ```powershell
   python -m app.main
   ```

   Expected output:
   ```
   * Running on http://127.0.0.1:5000
   * Restarting with stat
   * Debugger is active!
   ```

### Frontend Setup (Next.js)

1. **Return to project root:**
   ```powershell
   cd ..
   ```

2. **Start Next.js dev server:**
   ```powershell
   pnpm dev
   ```

   Expected output:
   ```
   ▲ Next.js 16.0.10 (Turbopack)
   - Local: http://localhost:3000
   ```

## 📱 User Flow

1. **Landing Page** (`http://localhost:3000`)
   - Click "Start Assessment"

2. **Domain Selection** (`/start`)
   - Select from 5 domains:
     * Machine Learning
     * Data Science
     * Operating Systems
     * Web Development
     * Computer Networks

3. **Assessment** (`/assessment?domain=...`)
   - Answer 10 AI-generated questions
   - Each question captures:
     * Written answer (textarea)
     * Time elapsed (automatic timer)
     * Self-confidence (0-100% slider)
   - Progress bar shows completion (1/10 → 10/10)

4. **Results Dashboard** (`/results/[sessionId]`)
   - Overall confidence score (0-100%)
   - Topic breakdown with color coding
   - Behavioral insights
   - Adaptive encouragement message

## 🧪 Testing the Flow

### Test 1: Backend Health
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health"
```

### Test 2: Generate Batch Questions
```powershell
$response = Invoke-RestMethod -Method Post `
  -Uri "http://127.0.0.1:5000/api/assessment/generate-batch" `
  -ContentType 'application/json' `
  -Body (@{ domain = 'machine-learning'; count = 3 } | ConvertTo-Json)

Write-Host "Session ID:" $response.session_id
$response.questions | ForEach-Object {
  Write-Host "`nQ:" $_.question.Substring(0, 100)...
  Write-Host "Topic:" $_.topic
}
```

### Test 3: Full Frontend Flow
1. Navigate to `http://localhost:3000`
2. Click "Start Assessment"
3. Select "Machine Learning"
4. Answer first question with varying confidence
5. Complete all 10 questions
6. View results with analytics

## 🔧 Troubleshooting

### Issue: "Port 3000 is in use"
```powershell
# Kill processes on port 3000/3001
Get-NetTCPConnection -LocalPort 3000,3001 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# Remove Next.js lock
Remove-Item -Force ".next\dev\lock" -ErrorAction SilentlyContinue

# Restart
pnpm dev
```

### Issue: Backend not responding
- Ensure virtual environment is activated
- Check `backend/.env` exists with valid `GEMINI_API_KEY`
- Verify Flask is running on 127.0.0.1:5000
- Check terminal for Python errors

### Issue: Questions not generating
- Verify Gemini API key is valid
- Check backend logs for `[Gemini] Using model:` message
- Ensure `gemini-2.5-flash` model is accessible
- Look for error messages in backend console

## 📊 Understanding the Scoring

### Confidence Categories
| Score Range | Category | Color |
|-------------|----------|-------|
| 85-100% | Strong Confidence | Green |
| 65-84% | Moderate Confidence | Blue |
| <65% | Needs Clarity | Orange |

### Behavioral Insights
The system generates insights based on:
- **Time patterns**: Fast (<30s avg) vs. Reflective (>60s avg)
- **Consistency**: Alignment between confidence and correctness
- **Fluctuation**: Variance across topics
- **Reasoning**: Correct answers with extended thinking time

## 🎨 UI Components

- **Progress Bar**: Shows question completion (1/10 → 10/10)
- **Timer**: Real-time elapsed time display
- **Confidence Slider**: 0-100% self-rating
- **Results Cards**: Color-coded topic performance
- **Insights Panel**: Behavioral analysis with natural language

## 📂 Key Files

```
app/
├── start/page.tsx           # Domain selection
├── assessment/page.tsx      # Question interaction
└── results/[sessionId]/page.tsx  # Analytics

lib/
├── assessment-context.tsx   # State management
├── confidence-scorer.ts     # 4-phase scoring
└── api-client.ts            # Backend calls

backend/app/
├── routes/assessment.py     # API endpoints
└── services/
    ├── gemini_analyzer.py   # Gemini integration
    └── question_generator.py # Batch generation
```

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Gemini API key configured
- [ ] Can navigate to `/start`
- [ ] Can select domain and see questions loading
- [ ] Questions are domain-specific (not fallback)
- [ ] Timer works and tracks time
- [ ] Confidence slider updates value
- [ ] Results page shows after 10 questions
- [ ] Behavioral insights are generated
- [ ] Score categorization works (colors match ranges)

## 🚀 Quick Start (Combined Command)

**Terminal 1 - Backend:**
```powershell
cd backend; & ..\.venv\Scripts\Activate.ps1; python -m app.main
```

**Terminal 2 - Frontend:**
```powershell
pnpm dev
```

Then visit: `http://localhost:3000`

---

**System Status**: Production-ready with dynamic Gemini question generation ✅
