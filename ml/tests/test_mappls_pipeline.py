import os
from src.route_pipeline.mappls_adapter import build_mappls_request, fetch_mappls_route, normalize_mappls_response
from src.route_pipeline.geometry import segment_route, decode_polyline, haversine_km

def test_mappls_request_builder():
    req = {
      "origin": {
        "lat": 26.1445,
        "lon": 91.7362
      },
      "destination": {
        "lat": 25.5788,
        "lon": 91.8933
      },
      "profile": "driving",
      "speedTypes": "optimal",
      "date_time": {
        "type": 0,
        "value": ""
      },
      "alternatives": 2,
      "avoid_locations": [],
      "avoid_polygons": []
    }
    params = build_mappls_request(req)
    assert params['locations'] == "91.7362,26.1445;91.8933,25.5788"
    assert params['alternatives'] == 2
    assert params['speedTypes'] == "optimal"
    assert params['date_time'] == "0,\"\""

def test_mock_response_and_normalization():
    params = {"locations": "91.7362,26.1445;91.8933,25.5788", "alternatives": 2}
    raw = fetch_mappls_route(params, mode="mock")
    
    assert "source" in raw
    assert "trip" in raw
    assert "alternates" in raw
    assert len(raw["alternates"]) == 2
    
    norm = normalize_mappls_response(raw)
    assert len(norm["routes"]) == 3
    assert norm["routes"][0]["route_id"] == "primary"
    assert "distance_km" in norm["routes"][0]
    assert "duration_seconds" in norm["routes"][0]
    assert "geometry" in norm["routes"][0]

def test_geometry_decoder_and_segmentation():
    points = [{"lat": 0, "lon": 0}, {"lat": 0.0, "lon": 0.01}, {"lat": 0.0, "lon": 0.02}]
    segs = segment_route(points, target_km=1.0)
    assert len(segs) > 0
    assert "segment_index" in segs[0]
    assert "start_km" in segs[0]

def test_live_mode_fails_without_token():
    try:
        fetch_mappls_route({}, mode="live", token=None)
        assert False, "Should have failed"
    except ValueError as e:
        assert 'MAPPLS_ACCESS_TOKEN is missing' in str(e)

if __name__ == '__main__':
    test_mappls_request_builder()
    test_mock_response_and_normalization()
    test_geometry_decoder_and_segmentation()
    test_live_mode_fails_without_token()
    print('All tests passed.')
