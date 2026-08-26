import os
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "eta_xgb_v1.pkl"))
_MODEL_CACHE = None

FEATURE_ORDER = [
    'segment_distance_km', 'mappls_baseline_eta_minutes', 'mappls_baseline_speed_kmph',
    'disruption_risk', 'active_incident_count_1km', 'active_incident_severity_score',
    'rain_1h', 'rain_6h', 'rain_24h', 'soil_moisture_surface', 'soil_moisture_delta_24h',
    'slope_mean', 'slope_max', 'hour_of_day', 'day_of_week', 'month',
    'historical_mean_travel_time_minutes', 'historical_median_travel_time_minutes',
    'recent_travel_time_15m', 'recent_travel_time_30m', 'recent_travel_time_60m'
]

def load_model():
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        _MODEL_CACHE = joblib.load(MODEL_PATH)
    return _MODEL_CACHE

def predict_route_eta(route_data: dict, timestamp_str: str) -> dict:
    model = load_model()
    
    segments = route_data.get('segments', [])
    if not segments:
        return {
            "route_id": route_data['route_id'],
            "mappls_baseline_route_eta_minutes": float(route_data.get('mappls_baseline_route_eta_minutes', 0)),
            "predicted_route_delay_minutes": 0.0,
            "adjusted_route_eta_minutes": float(route_data.get('mappls_baseline_route_eta_minutes', 0)),
            "segments": []
        }
        
    out_segments = []
    feature_rows = []
    
    for seg in segments:
        row = [seg.get(f) for f in FEATURE_ORDER]
        if None in row:
            missing = [f for f in FEATURE_ORDER if seg.get(f) is None]
            raise ValueError(f"Missing Model 2 features in segment {seg.get('segment_id')}: {missing}")
        feature_rows.append(row)
        
    X = pd.DataFrame(feature_rows, columns=FEATURE_ORDER)
    predicted_delays = model.predict(X)
    
    # Post process delays
    predicted_delays = np.maximum(0, predicted_delays)
    
    total_delay = 0.0
    for seg, delay in zip(segments, predicted_delays):
        d = float(delay)
        total_delay += d
        adj = float(seg['mappls_baseline_eta_minutes']) + d
        out_segments.append({
            "segment_id": seg['segment_id'],
            "mappls_baseline_eta_minutes": float(seg['mappls_baseline_eta_minutes']),
            "predicted_delay_minutes": float(round(d, 4)),
            "adjusted_eta_minutes": float(round(adj, 4))
        })
        
    base_route_eta = float(route_data.get('mappls_baseline_route_eta_minutes', 0))
    adjusted_route_eta = base_route_eta + total_delay
    
    return {
        "route_id": route_data['route_id'],
        "mappls_baseline_route_eta_minutes": float(round(base_route_eta, 4)),
        "predicted_route_delay_minutes": float(round(total_delay, 4)),
        "adjusted_route_eta_minutes": float(round(adjusted_route_eta, 4)),
        "segments": out_segments
    }
