def generate_synthetic_features(segment, route_id):
    idx = segment.get("segment_index", 0)
    
    # Base feature template (safe values)
    features = {
        "month": 6,
        "slope_mean": 10.0,
        "slope_max": 15.0,
        "elevation_change": 100.0,
        "historical_landslide_count_1km": 0,
        "historical_landslide_count_5km": 0,
        "days_since_nearest_landslide": 1000,
        "historical_route_landslide_density": 0.0,
        "rain_1h": 0.0,
        "rain_6h": 0.0,
        "rain_24h": 0.0,
        "rain_72h": 0.0,
        "rain_change_3h": 0.0,
        "soil_moisture_surface": 0.1,
        "soil_moisture_rootzone": 0.1,
        "soil_moisture_delta_24h": 0.0,
        "active_incident_count_1km": 0,
        "active_incident_severity_score": 0.0
    }
    
    # Introduce some synthetic danger deterministically based on route_id + idx
    # e.g., 'primary' gets some danger on idx 3, 'alternative_1' is mostly safe
    magic = hash(f"{route_id}_{idx}") % 100
    
    if magic < 10:
        features["rain_24h"] = 150.0
        features["slope_mean"] = 35.0
        features["active_incident_severity_score"] = 0.9
    elif magic < 30:
        features["rain_24h"] = 50.0
        features["slope_mean"] = 20.0
        features["active_incident_severity_score"] = 0.5
        
    return features
