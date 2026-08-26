# MAARG — ML Service (CV / NLP / News + Predictive Models)

Standalone **FastAPI microservice** for incident verification and multilingual alerting.
It runs independently on **port 8001** — the main backend (port 8000) talks to it via simple HTTP calls. No shared code, no shared database.

## Components

- Disaster / disruption prediction (Model 1)
- Dynamic ETA prediction (Model 2)
- CV incident verification / NLP parsing / multilingual alerts
- Supply-chain forecasting

## Data pipeline

Raw Data
→ Cleaning
→ Spatial/Temporal Alignment
→ Feature Engineering
→ Training Dataset
→ Model Training
→ Evaluation
→ FastAPI Inference

## Architecture

```
Field Worker (photo + text)
        |
        v
Backend (Anshu) :8000  --->  ML Service :8001
                             POST /api/v1/incidents/report
                                    |
                     1. CV Verification (Gemini 3.6 Flash)
                        - checks if photo really shows a disaster
                        - REJECTS selfies/memes/fake reports
                     2. NLP Parser (offline keyword scoring)
                        - extracts cause / severity / location from text
                     3. Alert Generation
                        - English -> Hindi -> Assamese translation
                                    |
                             JSON response
```

## Modules

| Module | File | What it does |
|---|---|---|
| CV Verification | `src/cv/verify.py` | Gemini vision call: VERIFIED / REJECTED + type + severity + confidence |
| NLP Parser | `src/nlp/parser.py` | Offline keyword scorer: cause, severity, location clue |
| Translator | `src/nlp/translator.py` | GoogleTranslator first, Gemini fallback, static text as last resort |
| News Feed | `src/news/rss_fetcher.py` | Google News RSS for disasters in Assam / Meghalaya / Sikkim |
| Live Bridge | `src/live/live_bridge.py` | (stub) pushes verified incident coords to backend rerouting API |
| Disruption Risk | `src/model1_disruption_risk/route_risk.py` | Route disruption risk prediction (Model 1) |
| Route ETA | `src/model2_eta/route_eta.py` | Dynamic ETA prediction (Model 2) |
| Route Pipeline | `src/route_pipeline/` | Mappls adapter, geometry, synthetic features |

## Setup & Run

```powershell
cd ml
python -m venv .venv            # once
.venv\Scripts\pip install -r requirements.txt
# put a valid key in .env:
# GEMINI_API_KEY=<your key>     ('AIza...' legacy or 'AQ.' new format both work)

.venv\Scripts\python.exe src\api\incident_router.py
# server starts on http://localhost:8001
```

Interactive docs: `http://localhost:8001/docs`

## API Contract (what the backend team needs)

### 1. Report an incident

`POST http://localhost:8001/api/v1/incidents/report`
**multipart/form-data**:

| Field | Type | Required |
|---|---|---|
| `text` | string | yes |
| `image` | file (jpg/png/avif) | no |

**Response** (JSON). **Read only `final_decision` and `alerts`** — the other two blocks are debug detail.

```json
{
  "cv_verification": {
    "verification_status": "VERIFIED",
    "disaster_type": "LANDSLIDE",
    "severity": "CRITICAL",
    "confidence": 0.98,
    "ai_explanation": "..."
  },
  "nlp_extraction": {
    "cause": "LANDSLIDE",
    "severity": "CRITICAL",
    "location_clue": "km 12"
  },
  "final_decision": {
    "is_verified": true,
    "is_rejected": false,
    "cause": "LANDSLIDE",
    "severity": "CRITICAL"
  },
  "alerts": {
    "en": "Critical landslide reported km 12. Route affected.",
    "hi": "...",
    "as": "..."
  }
}
```

Rules for consumers:
- If `final_decision.is_rejected == true` → report is fake/irrelevant, `alerts` is empty, ignore it.
- Otherwise use `final_decision.cause` / `severity` to trigger rerouting, and push `alerts.{en,hi,as}` to drivers.
- No image? The service still works via pure NLP (`cv_verification` will be `"UNCERTAIN"`).

### 2. Live NER disaster news

`GET http://localhost:8001/api/v1/news/ner`

```json
{
  "status": "success",
  "articles": [
    { "title": "...", "link": "...", "published": "...", "source": "...", "tag": "FLOOD" }
  ]
}
```

Tags: `LANDSLIDE | FLOOD | WEATHER | GENERAL`.

### 3. Predictive models

- `POST /risk/predict` — route disruption risk (Model 1)
- `POST /eta/predict` — dynamic ETA (Model 2)

## Quick test (with real images)

```powershell
curl.exe -X POST http://localhost:8001/api/v1/incidents/report `
  -F "text=landslide blocked the road at km 12, completely impassable" `
  -F "image=@cv_test_images/road landslide.jpg"
```

Verified test results:
- Real landslide photo → `VERIFIED`, CRITICAL, 98% confidence
- Fake meme image claiming landslide → `REJECTED` at 99%, alerts suppressed
- Text-only ("bridge washed away near Jorhat") → NLP fallback: INFRASTRUCTURE_DAMAGE / CRITICAL
- Assamese alerts are written in Bengali-Assamese script (looks like Bengali — it is not)

## Notes

- Port 8001 is deliberate: port 8000 belongs to the main backend.
- Severity enum everywhere: `CRITICAL | HIGH | MODERATE | LOW`.
- Cause enums: `LANDSLIDE | FLOOD | INFRASTRUCTURE_DAMAGE | BLOCKAGE | DAMAGED_BRIDGE | FALLEN_TREE | CLEAR_ROAD | IRRELEVANT | UNKNOWN`.
- Never commit `.env`. Rotate any key that gets exposed.

## Local Environment

Python virtual environment:

ml/.venv
