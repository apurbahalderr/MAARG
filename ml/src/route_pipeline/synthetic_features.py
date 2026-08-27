import hashlib

def generate_synthetic_features(segment: dict, route_id: str) -> dict:
    """
    Deterministic mock features based on route and segment index.
    Generates BOTH Model 1 (18 features) and Model 2 (ETA) features.
    """
    seg_idx = segment.get('segment_index', 0)
    seed_str = f"{route_id}_{seg_idx}"
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    
    # Base deterministic values using modulo
    slope = float(5 + (h % 20))
    rain = float(h % 100)
    
    features = {
        # --- MODEL 1 FEATURES (18 exact) ---
        "month": 6,
        "slope_mean": slope,
        "slope_max": slope + 5.0,
        "elevation_change": slope * 10,
        "historical_landslide_count_1km": h % 2,
        "historical_landslide_count_5km": h % 5,
        "days_since_nearest_landslide": 100 + (h % 900),
        "historical_route_landslide_density": float((h % 10) / 10),
        "rain_1h": rain * 0.1,
        "rain_6h": rain * 0.5,
        "rain_24h": rain,
        "rain_72h": rain * 2,
        "rain_change_3h": float((h % 10) - 5),
        "soil_moisture_surface": float(20 + (h % 30)) / 100,
        "soil_moisture_rootzone": float(25 + (h % 30)) / 100,
        "soil_moisture_delta_24h": float((h % 10) - 5) / 100,
        "active_incident_count_1km": h % 2,
        "active_incident_severity_score": float((h % 3) / 2),
        
        # --- MODEL 2 SPECIFIC FEATURES ---
        # Note: 'disruption_risk' is added in the pipeline AFTER Model 1
        "segment_distance_km": segment.get('distance_km', 1.0),
        "mappls_baseline_eta_minutes": segment.get('duration_seconds', 120) / 60.0,
        "mappls_baseline_speed_kmph": float(30 + (h % 30)),
        "hour_of_day": 10,
        "day_of_week": 2,
        "historical_mean_travel_time_minutes": 2.5 + (h % 5),
        "historical_median_travel_time_minutes": 2.4 + (h % 5),
        "recent_travel_time_15m": 2.6 + (h % 6),
        "recent_travel_time_30m": 2.6 + (h % 6),
        "recent_travel_time_60m": 2.5 + (h % 6)
    }
    
    return features
