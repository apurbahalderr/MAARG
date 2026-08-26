import json
import sys
from src.live.mappls_adapter import build_mappls_request, fetch_mappls_route, normalize_mappls_response
from src.live.geometry import decode_polyline, haversine_km, segment_route
from src.live.synthetic_features import generate_synthetic_features
from src.live.route_risk import predict_route_risk
from src.live.route_eta import predict_route_eta

def run_integration():
    print("--- RUNNING FULL LOCAL INTEGRATION TEST ---\n")
    
    # 1. Mock Request
    request = {
        "origin": {"lat": 26.1445, "lon": 91.7362},
        "destination": {"lat": 25.5788, "lon": 91.8933},
        "profile": "driving",
        "speedTypes": "optimal",
        "alternatives": 2
    }
    
    # 2. Mappls Mock Call
    params = build_mappls_request(request)
    raw_resp = fetch_mappls_route(params, mode="mock")
    norm_resp = normalize_mappls_response(raw_resp)
    
    print(f"Candidate routes from Mappls mock: {len(norm_resp['routes'])}\n")
    
    model2_request = {
        "timestamp": "2026-08-26T10:15:00+05:30",
        "routes": []
    }
    
    for r in norm_resp['routes']:
        route_id = r['route_id']
        dist_km = r['distance_km']
        duration_s = r['duration_seconds']
        polyline = r['geometry']['value']
        
        # Geometry & Segmentation
        pts = decode_polyline(polyline)
        segments = segment_route(pts, target_km=1.0)
        
        route_payload_m1 = {
            "route_id": route_id,
            "segments": []
        }
        
        # Attach features
        for seg in segments:
            # Add basic duration approximation based on distance ratio for the segment
            seg_dist = seg['end_km'] - seg['start_km']
            seg['distance_km'] = seg_dist
            seg['duration_seconds'] = (seg_dist / dist_km) * duration_s if dist_km > 0 else 0
            
            features = generate_synthetic_features(seg, route_id)
            seg['features'] = features
            route_payload_m1['segments'].append({
                "segment_id": f"{route_id}_s{seg['segment_index']:03d}",
                "features": features
            })
            
        # Model 1 (Disruption Risk)
        m1_result = predict_route_risk(route_payload_m1)
        
        # Build Model 2 input based on Model 1 output and Segment Features
        route_payload_m2 = {
            "route_id": route_id,
            "mappls_baseline_route_eta_minutes": float(duration_s) / 60.0,
            "segments": []
        }
        
        for i, seg in enumerate(route_payload_m1['segments']):
            seg_id = seg['segment_id']
            # Find the disruption risk for this segment (for now just using route-level mean proxy, 
            # or better yet, evaluate Model 1 per segment. Wait, Model 1's predict_route_risk 
            # uses the XGBoost model to score each segment. Let's just run it again per segment or 
            # extract it if we returned it. Since Model 1 doesn't return segment-level risks directly 
            # in its schema (only mean/p90/max and high_risk list), we will approximate or do a fast 
            # single predict for the feature to fulfill the payload.)
            
            # To be strictly compliant, we need a disruption_risk float for each segment.
            # We can use the route's mean segment risk as a fallback or directly call model.
            seg_risk = m1_result['mean_segment_risk']
            if seg_id in m1_result['critical_segments']:
                seg_risk = 0.85
            elif seg_id in m1_result['high_risk_segments']:
                seg_risk = 0.60
                
            features = seg['features']
            features['disruption_risk'] = seg_risk
            features['segment_id'] = seg_id
            
            route_payload_m2['segments'].append(features)
            
        model2_request['routes'].append(route_payload_m2)

    # Model 2 (Risk-Adjusted ETA)
    final_output = {
        "routes": []
    }
    
    for req_route in model2_request['routes']:
        m2_result = predict_route_eta(req_route, model2_request['timestamp'])
        final_output['routes'].append(m2_result)
        
    print("=== FINAL MODEL 2 (ETA) JSON OUTPUT ===")
    print(json.dumps(final_output, indent=2))

if __name__ == "__main__":
    run_integration()
