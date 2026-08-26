import os
import json

from src.route_pipeline.mappls_adapter import build_mappls_request, fetch_mappls_route, normalize_mappls_response
from src.route_pipeline.geometry import decode_polyline, segment_route
from src.route_pipeline.synthetic_features import generate_synthetic_features
from src.model1_disruption_risk.route_risk import predict_route_risk

def run_local_pipeline():
    mappls_mode = os.getenv("MAPPLS_MODE", "mock")
    mappls_token = os.getenv("MAPPLS_ACCESS_TOKEN")

    print(f"--- RUNNING IN {mappls_mode.upper()} MODE ---")

    maarg_request = {
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
    
    print("\n1. MAARG Internal Route Request:")
    print(json.dumps(maarg_request, indent=2))

    mappls_params = build_mappls_request(maarg_request)
    print("\n2. Mappls Request Parameters:")
    print(json.dumps(mappls_params, indent=2))

    raw_response = fetch_mappls_route(mappls_params, mode=mappls_mode, token=mappls_token)
    print("\n3. Mock Raw Mappls Response:")
    print(json.dumps(raw_response, indent=2))

    normalized_response = normalize_mappls_response(raw_response)
    print("\n4. Normalized Mappls Response:")
    print(json.dumps(normalized_response, indent=2))

    model_request = {
        "timestamp": "2024-03-10 00:00:00",
        "routes": []
    }
    
    total_segments = 0
    sample_segment = None
    sample_features = None

    for route in normalized_response["routes"]:
        geom_str = route["geometry"]["value"]
        decoded_points = decode_polyline(geom_str)
        
        segments = segment_route(decoded_points, target_km=1.0)
        total_segments += len(segments)
        
        route_for_model = {
            "route_id": route["route_id"],
            "segments": []
        }
        
        for seg in segments:
            features = generate_synthetic_features(seg, route["route_id"])
            
            if not sample_segment:
                sample_segment = seg
                sample_features = features
                
            route_for_model["segments"].append({
                "segment_id": f"{route['route_id']}_s{seg['segment_index']:03d}",
                "features": features
            })
            
        model_request["routes"].append(route_for_model)

    print("\n5. Example Analytical Segment:")
    print(json.dumps(sample_segment, indent=2))
    
    print("\n6. Example Model 1 Features:")
    print(json.dumps(sample_features, indent=2))
    
    print(f"\n7. Total Analytical Segments Generated: {total_segments}")

    model_response = {"routes": []}
    for r in model_request["routes"]:
        risk_summary = predict_route_risk(r)
        model_response["routes"].append(risk_summary)

    print("\n8. Final Model 1 Response:")
    print(json.dumps(model_response, indent=2))

if __name__ == '__main__':
    run_local_pipeline()
