import os
import json
from .geometry import encode_polyline

def build_mappls_request(maarg_req):
    origin = maarg_req['origin']
    dest = maarg_req['destination']
    
    locations = f"{origin['lon']},{origin['lat']};{dest['lon']},{dest['lat']}"
    
    params = {
        "locations": locations,
        "profile": maarg_req.get('profile', 'driving'),
        "speedTypes": maarg_req.get('speedTypes', 'optimal'),
        "alternatives": maarg_req.get('alternatives', 2)
    }
    
    if 'date_time' in maarg_req:
        dt = maarg_req['date_time']
        params['date_time'] = f"{dt.get('type', 0)},\"{dt.get('value', '')}\""
        
    if 'avoid_locations' in maarg_req and maarg_req['avoid_locations']:
        avoid_locs = []
        for loc in maarg_req['avoid_locations']:
            avoid_locs.append(f"{loc['lon']},{loc['lat']}")
        params['avoid_locations'] = ";".join(avoid_locs)
        
    if 'avoid_polygons' in maarg_req and maarg_req['avoid_polygons']:
        # Mappls expects exterior rings array. We format as a JSON string or specific API format.
        # Often it's a URL-encoded JSON or specific string block. We'll build a string representation:
        # e.g., [[lon,lat],[lon,lat]]
        polys_str = []
        for poly in maarg_req['avoid_polygons']:
            poly_coords = [f"[{pt['lon']},{pt['lat']}]" for pt in poly]
            polys_str.append(f"[{','.join(poly_coords)}]")
        params['avoid_polygons'] = f"[{','.join(polys_str)}]"
        
    return params

def _generate_mock_geometry(start_lat, start_lon, steps, offset):
    coords = []
    for i in range(steps):
        coords.append({
            "lat": start_lat + (i * 0.005) + offset,
            "lon": start_lon + (i * 0.005) + offset
        })
    return encode_polyline(coords)

def fetch_mappls_route(params, mode="mock", token=None):
    if mode == "live":
        if not token:
            raise ValueError("MAPPLS_ACCESS_TOKEN is missing for live mode")
        # In a real implementation: requests.get("https://route.mappls.com/routev2/direction/route", params=...)
        raise NotImplementedError("Live mode transport is not fully implemented yet")
        
    # MOCK MODE for Predictive Routing API
    locs = params['locations'].split(';')
    start_lon, start_lat = map(float, locs[0].split(','))
    
    num_alts = int(params.get('alternatives', 0))
    total_routes = min(3, 1 + num_alts) # Primary + up to 2 alternates
    
    def make_trip(index):
        dist = 103420 + index*2000
        dur = 11200 + index*500
        return {
            "summary": {
                "length": dist,
                "time": dur,
                "base_time": dur - 100
            },
            "pts": _generate_mock_geometry(start_lat, start_lon, 50, index * 0.01),
            "legs": [{"steps": []}]
        }
        
    resp = {
        "source": "mock",
        "trip": make_trip(0)
    }
    
    if total_routes > 1:
        resp["alternates"] = []
        for i in range(1, total_routes):
            resp["alternates"].append({"trip": make_trip(i)})
            
    return resp

def normalize_mappls_response(raw_resp):
    normalized = []
    
    # Primary route
    if "trip" in raw_resp:
        trip = raw_resp["trip"]
        normalized.append({
            "route_id": "primary",
            "distance_km": trip.get("summary", {}).get("length", 0) / 1000.0,
            "duration_seconds": trip.get("summary", {}).get("time", 0),
            "geometry": {
                "format": "encoded_polyline",
                "value": trip.get("pts", "")
            },
            "steps": []
        })
        
    # Alternates
    if "alternates" in raw_resp:
        for i, alt in enumerate(raw_resp["alternates"]):
            if "trip" in alt:
                trip = alt["trip"]
                normalized.append({
                    "route_id": f"alternative_{i+1}",
                    "distance_km": trip.get("summary", {}).get("length", 0) / 1000.0,
                    "duration_seconds": trip.get("summary", {}).get("time", 0),
                    "geometry": {
                        "format": "encoded_polyline",
                        "value": trip.get("pts", "")
                    },
                    "steps": []
                })
                
    return {"routes": normalized}
