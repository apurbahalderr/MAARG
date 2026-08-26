import os
import sys
from deep_translator import GoogleTranslator
from dotenv import load_dotenv

FALLBACK_HI = "अनुवाद उपलब्ध नहीं है"
FALLBACK_AS = "অনুবাদ উপলব্ধ নহয়"

def _gemini_translate(text: str, target_lang_name: str):
    """Fallback translation via Gemini API when free scrapers fail."""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = f"Translate this disaster alert into {target_lang_name}. Respond ONLY with the translation:\n{text}"
        resp = client.models.generate_content(model="gemini-3.6-flash", contents=prompt)
        return resp.text.strip()
    except Exception as e:
        print(f"Gemini translation failed: {e}")
        return None

def _translate(text: str, lang_code: str, lang_name: str):
    try:
        return GoogleTranslator(source='en', target=lang_code).translate(text)
    except Exception as e:
        print(f"GoogleTranslator ({lang_code}) failed: {e}")
        result = _gemini_translate(text, lang_name)
        return result if result else (FALLBACK_HI if lang_code == "hi" else FALLBACK_AS)

def generate_multilingual_alert(cause: str, severity: str, location_clue: str):
    """
    Generates a human-readable alert in English, then translates to Hindi and Assamese.
    Maps system enums to natural language.
    """
    cause_map = {
        "INFRASTRUCTURE_DAMAGE": "infrastructure damage",
        "BLOCKAGE": "road blockage",
        "DAMAGED_BRIDGE": "damaged bridge",
        "FALLEN_TREE": "fallen tree"
    }
    natural_cause = cause_map.get(cause, cause.lower().replace("_", " "))
    
    en_alert = f"{severity.capitalize()} {natural_cause} reported {location_clue}. Route affected."

    hi_alert = _translate(en_alert, "hi", "Hindi")
    as_alert = _translate(en_alert, "as", "Assamese")

    return {
        "en": en_alert,
        "hi": hi_alert,
        "as": as_alert
    }
