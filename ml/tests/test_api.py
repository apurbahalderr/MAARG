from fastapi.testclient import TestClient
from src.api.incident_router import app
from src.model1_disruption_risk.route_risk import FEATURE_ORDER

client = TestClient(app)

def create_segment(segment_id, score_type='low', override_features=None):
    features = {f: 0.0 for f in FEATURE_ORDER}
    if score_type == 'high':
        # Using the exact features from the high-risk row in CSV
        features.update({
            'month': 6,
            'slope_mean': 25.267,
            'slope_max': 28.880,
            'elevation_change': 900.0,
            'historical_landslide_count_1km': 0,
            'historical_landslide_count_5km': 0,
            'days_since_nearest_landslide': 2102,
            'historical_route_landslide_density': 0.2007,
            'rain_1h': 13.588,
            'rain_6h': 46.659,
            'rain_24h': 184.357,
            'rain_72h': 422.751,
            'rain_change_3h': -1.073,
            'soil_moisture_surface': 0.288,
            'soil_moisture_rootzone': 0.256,
            'soil_moisture_delta_24h': 0.139,
            'active_incident_count_1km': 0,
            'active_incident_severity_score': 0.0
        })
    
    if override_features:
        features.update(override_features)
        
    return {
        "segment_id": segment_id,
        "features": features
    }

def test_1_critical_segment():
    # TEST 1
    route = {
        "route_id": "r1",
        "segments": [
            create_segment("s1", score_type="high")
        ]
    }
    payload = {"timestamp": "2024-03-10 00:00:00", "routes": [route]}
    response = client.post("/risk/predict", json=payload)
    print("TEST 1 Status:", response.status_code)
    data = response.json()
    print("TEST 1 Result:", data)
    assert response.status_code == 200

def test_missing_feature():
    # TEST 5
    features = {f: 0.0 for f in FEATURE_ORDER}
    del features['month']
    route = {
        "route_id": "r2",
        "segments": [
            {"segment_id": "s2", "features": features}
        ]
    }
    payload = {"timestamp": "2024-03-10 00:00:00", "routes": [route]}
    response = client.post("/risk/predict", json=payload)
    print("TEST 5 Status:", response.status_code)
    print("TEST 5 Result (Missing feature):", response.json())
    assert response.status_code == 400

if __name__ == '__main__':
    test_1_critical_segment()
    test_missing_feature()
