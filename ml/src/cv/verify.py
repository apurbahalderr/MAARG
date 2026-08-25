import os
import json
import time
from PIL import Image
from google import genai
from google.genai import types
from dotenv import load_dotenv

MAX_RETRIES = 3

def verify_incident_image_and_text(image_path: str, report_text: str):
    """
    Analyzes both the field worker's photo and text message.
    Uses the modern google-genai SDK, gemini-2.5-flash, and native JSON parsing.
    """
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    # Basic check to prevent runtime crashes if key is missing
    # Note: keys may start with 'AIza' (legacy) or 'AQ.' (new format) — both valid
    if not api_key:
        print("WARNING: Missing Gemini API Key.")
        return {
            "verification_status": "UNCERTAIN",
            "disaster_type": "UNKNOWN",
            "severity": "UNKNOWN",
            "confidence": 0.0,
            "ai_explanation": "Missing API key."
        }

    try:
        client = genai.Client(api_key=api_key)
        img = Image.open(image_path)
        
        prompt = f"""
        You are 'MAARG AI', an expert disaster-management verification system in the NER of India.
        FIELD WORKER TEXT REPORT: "{report_text}"
        
        INSTRUCTIONS:
        1. Compare the image with the text.
        2. Reject selfies, memes, indoor pictures, or completely clear roads.
        3. Determine the disaster type: [LANDSLIDE, FLOOD, DAMAGED_BRIDGE, FALLEN_TREE, CLEAR_ROAD, IRRELEVANT]
        4. Determine severity: [CRITICAL, HIGH, MODERATE, LOW]
        
        Respond with raw JSON following exactly these keys:
        "verification_status" (VERIFIED or REJECTED)
        "disaster_type" (string)
        "severity" (string)
        "confidence" (float)
        "ai_explanation" (string)
        """
        
        # Retry loop: transient network errors (WinError 10054, timeouts) are common on flaky networks
        last_err = None
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                # Guarantee raw JSON output natively
                response = client.models.generate_content(
                    model='gemini-3.6-flash',
                    contents=[prompt, img],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                last_err = e
                print(f"Gemini call attempt {attempt}/{MAX_RETRIES} failed: {e}")
                if attempt < MAX_RETRIES:
                    time.sleep(2 * attempt)
        raise last_err
        
    except Exception as e:
        print(f"Error during CV verification: {e}")
        return {
            "verification_status": "UNCERTAIN",
            "disaster_type": "UNKNOWN",
            "severity": "UNKNOWN",
            "confidence": 0.0,
            "ai_explanation": str(e)
        }
