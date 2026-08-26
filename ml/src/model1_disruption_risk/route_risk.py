import os
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "models", "disruption_xgb.pkl")
_MODEL_CACHE = None

FEATURE_ORDER = [
    'month', 'slope_mean', 'slope_max', 'elevation_change',
    'historical_landslide_count_1km', 'historical_landslide_count_5km',
    'days_since_nearest_landslide', 'historical_route_landslide_density',
    'rain_1h', 'rain_6h', 'rain_24h', 'rain_72h', 'rain_change_3h',
    'soil_moisture_surface', 'soil_moisture_rootzone', 'soil_moisture_delta_24h',
    'active_incident_count_1km', 'active_incident_severity_score'
]

def load_model():
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(MODEL_PATH)
    return _MODEL_CACHE

def get_risk_band(score: float) -> str:
    if score < 0.25: return "LOW"
    elif score < 0.50: return "MODERATE"
    elif score < 0.75: return "HIGH"
    else: return "CRITICAL"

def predict_route_risk(route_data: dict) -> dict:
    model = load_model()
    segments = route_data.get('segments', [])
    if not segments:
        raise ValueError("Route must contain at least one segment")
    
    segment_scores = []
    high_risk_segments = []
    critical_segments = []
    
    # Batch predict for efficiency
    feature_rows = []
    for seg in segments:
        features = seg.get('features', {})
        row = [features.get(f) for f in FEATURE_ORDER]
        if None in row:
            missing = [f for f in FEATURE_ORDER if features.get(f) is None]
            raise ValueError(f"Missing features in segment {seg.get('segment_id')}: {missing}")
        feature_rows.append(row)
        
    X = pd.DataFrame(feature_rows, columns=FEATURE_ORDER)
    # Using predict_proba to get likelihood in [0, 1]
    probs = model.predict_proba(X)[:, 1]
    
    for seg, prob in zip(segments, probs):
        score = float(prob)
        segment_scores.append(score)
        
        if score >= 0.75:
            critical_segments.append(seg['segment_id'])
        if score >= 0.50:
            high_risk_segments.append(seg['segment_id'])

    mean_score = np.mean(segment_scores)
    max_score = np.max(segment_scores)
    p90_score = np.percentile(segment_scores, 90)
    
    route_risk = 0.50 * mean_score + 0.30 * p90_score + 0.20 * max_score
    route_risk = float(np.clip(route_risk, 0.0, 1.0))
    
    return {
        "route_id": route_data['route_id'],
        "disruption_risk": route_risk,
        "risk_band": get_risk_band(route_risk),
        "mean_segment_risk": float(mean_score),
        "p90_segment_risk": float(p90_score),
        "max_segment_risk": float(max_score),
        "high_risk_segments": high_risk_segments,
        "critical_segments": critical_segments
    }
