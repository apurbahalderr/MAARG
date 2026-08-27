import os
import sys
import tempfile
import uvicorn

# Allow running this file directly (python src/api/incident_router.py)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from src.cv.verify import verify_incident_image_and_text
from src.nlp.parser import parse_incident_text
from src.nlp.translator import generate_multilingual_alert
from src.news.rss_fetcher import fetch_ner_disaster_news
from src.api.predictive_router import router as predictive_router

app = FastAPI(title="MAARG CV/NLP/News Service")

# Add CORS Middleware to allow Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predictive models (swarnim): /predict/risk, /predict/eta
app.include_router(predictive_router)

@app.post("/api/v1/incidents/report")
def report_incident(
    text: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """
    Accepts field text and (optional) image.
    Uses sync def so FastAPI handles the blocking network call in a threadpool.
    """
    verification_result = {
        "verification_status": "UNCERTAIN",
        "disaster_type": "UNKNOWN",
        "severity": "UNKNOWN"
    }

    # 1. Image Verification (if provided)
    if image and image.filename:
        image.file.seek(0)
        img_bytes = image.file.read()
        if not img_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image is empty.")

        # Secure temp file creation (prevents path traversal and race conditions)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(img_bytes)
            temp_img_path = tmp.name

        verification_result = verify_incident_image_and_text(temp_img_path, text)

        # Cleanup
        if os.path.exists(temp_img_path):
            os.remove(temp_img_path)

    # 2. NLP Extraction
    nlp_result = parse_incident_text(text)

    # 3. Final Decision Logic
    # If image was processed and REJECTED, do not alert.
    is_rejected = verification_result.get("verification_status") == "REJECTED"
    cv_ok = verification_result.get("verification_status") == "VERIFIED"

    # CV result is used ONLY when VERIFIED; on failure/uncertainty fall back to NLP
    if image and cv_ok:
        final_cause = verification_result.get("disaster_type", nlp_result["cause"])
        final_severity = verification_result.get("severity", nlp_result["severity"])
    else:
        final_cause = nlp_result["cause"]
        final_severity = nlp_result["severity"]

    alerts = {}
    if not is_rejected:
        alerts = generate_multilingual_alert(final_cause, final_severity, nlp_result["location_clue"])

    return {
        "cv_verification": verification_result,
        "nlp_extraction": nlp_result,
        "final_decision": {
            "is_verified": verification_result.get("verification_status") == "VERIFIED",
            "is_rejected": is_rejected,
            "cause": final_cause,
            "severity": final_severity,
        },
        "alerts": alerts
    }

@app.get("/api/v1/news/ner")
def get_live_news():
    try:
        news = fetch_ner_disaster_news()
        return {"status": "success", "articles": news}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Port 8001: port 8000 is reserved for the main backend (see live_bridge.py)
    uvicorn.run(app, host="0.0.0.0", port=8001)
