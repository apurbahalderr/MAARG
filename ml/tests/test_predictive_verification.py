import pytest
from src.route_pipeline.mappls_adapter import build_mappls_request, fetch_mappls_route, normalize_mappls_response
from src.route_pipeline.geometry import segment_route, decode_polyline, haversine_km
from src.route_pipeline.synthetic_features import generate_synthetic_features

def test_1_internal_json_validation():
    req = {
        "origin": {"lat": 26.1445, "lon": 91.7362},
        "destination": {"lat": 25.5788, "lon": 91.8933},
        "profile": "driving",
        "speedTypes": "optimal",
        "date_time": {"type": 0, "value": ""},
        "alternatives": 2,
        "avoid_locations": [],
        "avoid_polygons": []
    }
    assert "lat" in req["origin"]
    assert "lon" in req["origin"]
    assert req["alternatives"] == 2
    assert req["speedTypes"] == "optimal"
    assert req["date_time"]["type"] == 0

def test_2_mappls_location_conversion():
    req = {
        "origin": {"lat": 26.1445, "lon": 91.7362},
        "destination": {"lat": 25.5788, "lon": 91.8933}
    }
    params = build_mappls_request(req)
    assert params['locations'] == "91.7362,26.1445;91.8933,25.5788"

def test_3_predictive_routing_query():
    req = {
        "origin": {"lat": 26.1445, "lon": 91.7362},
        "destination": {"lat": 25.5788, "lon": 91.8933},
        "profile": "driving",
        "speedTypes": "optimal",
        "date_time": {"type": 0, "value": ""},
        "alternatives": 2
    }
    params = build_mappls_request(req)
    assert 'locations' in params
    assert 'speedTypes' in params
    assert 'date_time' in params
    assert 'alternatives' in params

def test_4_avoid_locations():
    req = {
        "origin": {"lat": 26.1, "lon": 91.7},
        "destination": {"lat": 25.5, "lon": 91.8},
        "avoid_locations": [{"lat": 25.5700, "lon": 91.8800}]
    }
    params = build_mappls_request(req)
    assert params['avoid_locations'] == "91.88,25.57"

def test_5_avoid_polygon():
    req = {
        "origin": {"lat": 26.1, "lon": 91.7},
        "destination": {"lat": 25.5, "lon": 91.8},
        "avoid_polygons": [
            [
                {"lat": 25.5700, "lon": 91.8800},
                {"lat": 25.5750, "lon": 91.8850},
                {"lat": 25.5650, "lon": 91.8900}
            ]
        ]
    }
    params = build_mappls_request(req)
    # expect array of exterior rings of [lon,lat]
    assert params['avoid_polygons'] == "[[[91.88,25.57],[91.885,25.575],[91.89,25.565]]]"

def test_6_alternatives():
    params = {"locations": "91.7,26.1;91.8,25.5", "alternatives": 0}
    raw = fetch_mappls_route(params, mode="mock")
    assert "trip" in raw
    assert "alternates" not in raw
    
    params2 = {"locations": "91.7,26.1;91.8,25.5", "alternatives": 1}
    raw2 = fetch_mappls_route(params2, mode="mock")
    assert len(raw2["alternates"]) == 1

def test_7_predictive_raw_response_normalization():
    params = {"locations": "91.7,26.1;91.8,25.5", "alternatives": 1}
    raw = fetch_mappls_route(params, mode="mock")
    norm = normalize_mappls_response(raw)
    assert len(norm["routes"]) == 2
    assert "distance_km" in norm["routes"][0]
    assert "duration_seconds" in norm["routes"][0]
    assert "geometry" in norm["routes"][0]

def test_8_geometry():
    params = {"locations": "91.7,26.1;91.8,25.5", "alternatives": 0}
    raw = fetch_mappls_route(params, mode="mock")
    norm = normalize_mappls_response(raw)
    pts = norm["routes"][0]["geometry"]["value"]
    decoded = decode_polyline(pts)
    assert len(decoded) > 0

def test_9_segmentation():
    points = [{"lat": 26.0, "lon": 91.0}, {"lat": 26.0, "lon": 91.01}, {"lat": 26.0, "lon": 91.02}]
    segs = segment_route(points, target_km=0.5)
    assert len(segs) > 1

def test_10_synthetic_feature_variation():
    seg = {"segment_index": 3}
    feat1 = generate_synthetic_features(seg, "primary")
    feat2 = generate_synthetic_features(seg, "primary")
    feat3 = generate_synthetic_features(seg, "alternative_1")
    
    assert feat1 == feat2 # Deterministic
    assert feat1 != feat3 # Varies by route_id

def test_15_live_mode_configuration():
    try:
        fetch_mappls_route({}, mode="live", token=None)
        assert False
    except ValueError as e:
        assert "MAPPLS_ACCESS_TOKEN is missing" in str(e)

if __name__ == "__main__":
    test_1_internal_json_validation()
    test_2_mappls_location_conversion()
    test_3_predictive_routing_query()
    test_4_avoid_locations()
    test_5_avoid_polygon()
    test_6_alternatives()
    test_7_predictive_raw_response_normalization()
    test_8_geometry()
    test_9_segmentation()
    test_10_synthetic_feature_variation()
    test_15_live_mode_configuration()
    print("ALL TESTS PASSED.")
