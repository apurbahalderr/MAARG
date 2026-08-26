from src.model2_eta.route_eta import predict_route_eta
from src.route_pipeline.synthetic_features import generate_synthetic_features

def test_eta_schema_and_calculation():
    segment = {"segment_index": 0, "distance_km": 1.5, "duration_seconds": 180}
    features = generate_synthetic_features(segment, "R1")
    features['segment_id'] = "R1_s000"
    features['disruption_risk'] = 0.5
    
    route_data = {
        "route_id": "R1",
        "mappls_baseline_route_eta_minutes": 3.0,
        "segments": [features]
    }
    
    result = predict_route_eta(route_data, "2026-08-26T10:15:00+05:30")
    
    assert "route_id" in result
    assert "predicted_route_delay_minutes" in result
    assert "adjusted_route_eta_minutes" in result
    assert result["predicted_route_delay_minutes"] >= 0
    assert result["adjusted_route_eta_minutes"] == result["mappls_baseline_route_eta_minutes"] + result["predicted_route_delay_minutes"]
    
    seg_res = result["segments"][0]
    assert "segment_id" in seg_res
    assert "predicted_delay_minutes" in seg_res
    assert seg_res["predicted_delay_minutes"] >= 0
    assert seg_res["adjusted_eta_minutes"] == seg_res["mappls_baseline_eta_minutes"] + seg_res["predicted_delay_minutes"]

def test_missing_feature_raises_error():
    features = {"segment_id": "R1_s000"}
    route_data = {
        "route_id": "R1",
        "mappls_baseline_route_eta_minutes": 3.0,
        "segments": [features]
    }
    try:
        predict_route_eta(route_data, "2026-08-26T10:15:00+05:30")
        assert False
    except ValueError as exc:
        assert "Missing Model 2 features" in str(exc)

def test_empty_segments():
    route_data = {
        "route_id": "R1",
        "mappls_baseline_route_eta_minutes": 3.0,
        "segments": []
    }
    result = predict_route_eta(route_data, "2026-08-26T10:15:00+05:30")
    assert result["predicted_route_delay_minutes"] == 0.0
    assert result["adjusted_route_eta_minutes"] == 3.0

if __name__ == '__main__':
    test_eta_schema_and_calculation()
    test_missing_feature_raises_error()
    test_empty_segments()
    print('Tests passed.')
