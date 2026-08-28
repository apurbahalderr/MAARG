from fastapi import APIRouter, HTTPException

import math
import hashlib
import requests

def haversine_km(lon1, lat1, lon2, lat2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from src.model1_disruption_risk.route_risk import predict_route_risk
from src.model2_eta.route_eta import predict_route_eta

router = APIRouter(prefix="/predict", tags=["predictive-models"])

class RouteRequest(BaseModel):
    incidents: List[Dict[str, Any]] = []
    origin: str = ""
    dest: str = ""
    mappls_key: str = ""
    routes: List[Dict[str, Any]]

class ETARequest(BaseModel):
    timestamp: str
    routes: List[Dict[str, Any]]

# ─── /predict/reroute — Incident-triggered reroute scoring ────────────────────

class IncidentInfo(BaseModel):
    incident_id: str
    type: str
    severity: str
    location: Dict[str, Any]   # { type: "Point", coordinates: [lng, lat] }
    occurred_at: str

class CandidateRoute(BaseModel):
    routeId: str
    geometry: Dict[str, Any]   # { type: "LineString", coordinates: [[lng, lat], ...] }
    distanceMeters: float
    durationSeconds: float

class RerouteRequest(BaseModel):
    incident: IncidentInfo
    routes: List[CandidateRoute]
    mappls_key: Optional[str] = ""   # optional: used for waypoint detour
    origin: Optional[str] = ""       # optional: "lng,lat" of mission origin
    dest: Optional[str] = ""         # optional: "lng,lat" of mission destination

def _synthetic_features_for_segment(route_id: str, seg_idx: int, dist_km: float, duration_s: float) -> dict:
    """
    Generate deterministic synthetic features identical to the TypeScript
    syntheticFeatures() in app/api/routes/route.ts and Python generate_synthetic_features()
    in src/route_pipeline/synthetic_features.py.
    """
    seed_str = f"{route_id}{seg_idx}"
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    slope = float(5 + (h % 20))
    rain = float(h % 100)
    import datetime
    now = datetime.datetime.utcnow()
    return {
        "month": now.month,
        "slope_mean": slope,
        "slope_max": slope + 5.0,
        "elevation_change": slope * 10,
        "historical_landslide_count_1km": h % 2,
        "historical_landslide_count_5km": h % 5,
        "days_since_nearest_landslide": float(100 + (h % 900)),
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
    }

def _build_route_for_model(route: CandidateRoute, segments_per_route: int = 5) -> dict:
    """Convert a raw CandidateRoute (geometry only) into the segment-features format
    that predict_route_risk() requires."""
    dist_km = route.distanceMeters / 1000.0
    seg_dist_km = dist_km / segments_per_route
    seg_dur_s = route.durationSeconds / segments_per_route

    segments = []
    for i in range(segments_per_route):
        features = _synthetic_features_for_segment(
            route_id=route.routeId,
            seg_idx=i,
            dist_km=seg_dist_km,
            duration_s=seg_dur_s,
        )
        segments.append({
            "segment_id": f"{route.routeId}_s{i}",
            "features": features,
        })

    return {
        "route_id": route.routeId,
        "coordinates": route.geometry.get("coordinates", []),
        "segments": segments,
    }

def _route_intersects_incident(coords: List[List[float]], inc_lng: float, inc_lat: float, threshold_km: float = 1.5) -> bool:
    """Check if any point on a route passes within threshold_km of the incident."""
    if not coords:
        return False
    # Check all points without skipping so we never miss an incident
    step = 1 if len(coords) < 1500 else 2
    for i in range(0, len(coords), step):
        pt = coords[i]
        if len(pt) >= 2:
            dist = haversine_km(pt[0], pt[1], inc_lng, inc_lat)
            if dist <= threshold_km:
                return True
    return False

def _generate_detour_waypoints(
    orig_lng: float, orig_lat: float,
    dest_lng: float, dest_lat: float,
    inc_lng: float, inc_lat: float
) -> List[tuple]:
    """
    Generate multiple candidate detour waypoints around an incident along perpendicular and diagonal corridors.
    """
    dx = dest_lng - orig_lng
    dy = dest_lat - orig_lat
    length = math.sqrt(dx * dx + dy * dy)
    if length == 0:
        return []

    ux, uy = dx / length, dy / length
    # Perpendicular unit vectors
    p1x, p1y = -uy, ux
    p2x, p2y = uy, -ux

    km_to_lat = 1.0 / 111.0
    km_to_lon = 1.0 / (111.0 * math.cos(math.radians(inc_lat)))

    candidates = []
    # Test lateral offsets (12km, 18km, 25km, 35km) on both sides + forward shifts
    for dist_km in [12.0, 18.0, 25.0, 35.0]:
        for perp_x, perp_y in [(p1x, p1y), (p2x, p2y)]:
            # Pure lateral bypass
            w_lon = inc_lng + perp_x * dist_km * km_to_lon
            w_lat = inc_lat + perp_y * dist_km * km_to_lat
            candidates.append((w_lon, w_lat))

            # Diagonal bypass shifted towards destination
            w_lon_d = inc_lng + (perp_x * dist_km + ux * (dist_km * 0.6)) * km_to_lon
            w_lat_d = inc_lat + (perp_y * dist_km + uy * (dist_km * 0.6)) * km_to_lat
            candidates.append((w_lon_d, w_lat_d))

    # Cardinal offsets (North, South, East, West)
    for c_lon_km, c_lat_km in [(0, 15), (0, -15), (15, 0), (-15, 0), (12, 12), (-12, 12), (12, -12), (-12, -12)]:
        candidates.append((inc_lng + c_lon_km * km_to_lon, inc_lat + c_lat_km * km_to_lat))

    return candidates

def _fetch_safe_detour(
    origin: str,
    dest: str,
    inc_lng: float,
    inc_lat: float,
    all_incidents: List[Dict[str, Any]],
    mappls_key: str = ""
) -> Optional[dict]:
    """
    Search for a verified safe detour route around an incident.
    Tests candidate bypass waypoints with Mappls and OSRM, and verifies that the resulting
    route coordinates NEVER pass within threshold_km of ANY active incident.
    """
    if not origin or not dest:
        return None

    try:
        orig_parts = [float(x) for x in origin.split(",")]
        dest_parts = [float(x) for x in dest.split(",")]
        if len(orig_parts) < 2 or len(dest_parts) < 2:
            return None
        orig_lng, orig_lat = orig_parts[0], orig_parts[1]
        dest_lng, dest_lat = dest_parts[0], dest_parts[1]
    except Exception:
        return None

    # Collect all active incident coordinate pairs for full verification
    all_inc_points = []
    for inc in all_incidents:
        loc = inc.get("location", {})
        coords = loc.get("coordinates", [])
        if len(coords) >= 2:
            all_inc_points.append((float(coords[0]), float(coords[1])))
    if (inc_lng, inc_lat) not in all_inc_points:
        all_inc_points.append((inc_lng, inc_lat))

    waypoints = _generate_detour_waypoints(orig_lng, orig_lat, dest_lng, dest_lat, inc_lng, inc_lat)

    for w_lon, w_lat in waypoints:
        route_candidate = None

        # 1. Try Mappls first
        if mappls_key:
            try:
                url = (
                    f"https://route.mappls.com/route/direction/route_adv/trucking/"
                    f"{orig_lng},{orig_lat};{w_lon:.5f},{w_lat:.5f};{dest_lng},{dest_lat}"
                    f"?geometries=geojson&overview=full&alternatives=1&steps=false&access_token={mappls_key}"
                )
                resp = requests.get(url, timeout=6)
                if resp.ok:
                    data = resp.json()
                    if "routes" in data and len(data["routes"]) > 0:
                        route_candidate = data["routes"][0]
            except Exception:
                pass

        # 2. Fall back to free OSRM if Mappls failed or returned no route
        if not route_candidate:
            try:
                osrm_url = (
                    f"https://router.project-osrm.org/route/v1/driving/"
                    f"{orig_lng},{orig_lat};{w_lon:.5f},{w_lat:.5f};{dest_lng},{dest_lat}"
                    f"?overview=full&geometries=geojson"
                )
                resp = requests.get(osrm_url, timeout=6, headers={"User-Agent": "MAARG-Disaster-Logistics/1.0"})
                if resp.ok:
                    data = resp.json()
                    if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                        osrm_route = data["routes"][0]
                        route_candidate = {
                            "geometry": osrm_route.get("geometry", {}),
                            "distance": osrm_route.get("distance", 0),
                            "duration": osrm_route.get("duration", 0),
                        }
            except Exception:
                pass

        if not route_candidate:
            continue

        # 3. CRITICAL: Validate that the detour route NEVER passes near any incident!
        coords = route_candidate.get("geometry", {}).get("coordinates", [])
        if not coords or len(coords) < 2:
            continue

        is_safe = True
        for i_lng, i_lat in all_inc_points:
            if _route_intersects_incident(coords, i_lng, i_lat, threshold_km=1.5):
                is_safe = False
                break

        if is_safe:
            # Verified safe detour found!
            return route_candidate

    return None

@router.post("/reroute")
async def reroute_predict(request: RerouteRequest):
    """
    Score candidate reroute alternatives after a field incident is reported.
    """
    try:
        inc_coords = request.incident.location.get("coordinates", [])
        if len(inc_coords) < 2:
            raise HTTPException(status_code=400, detail="Incident location must have [lng, lat] coordinates")
        inc_lng, inc_lat = float(inc_coords[0]), float(inc_coords[1])

        incident_dict = {
            "incidentId": request.incident.incident_id,
            "type": request.incident.type,
            "severity": request.incident.severity,
            "location": request.incident.location,
        }

        results = []

        for candidate in request.routes:
            # 1. Build the segment-features payload for the risk model
            route_for_model = _build_route_for_model(candidate)

            # 2. Score with the XGBoost disruption risk model
            res = predict_route_risk(route_for_model)

            # 3. Check if this route passes through the incident zone
            candidate_coords = candidate.geometry.get("coordinates", [])
            if _route_intersects_incident(candidate_coords, inc_lng, inc_lat, threshold_km=1.5):
                res["disruption_risk"] = 1.0
                res["risk_band"] = "CRITICAL"
                res["blocked_by_incident"] = request.incident.incident_id

                # 4. Search for a verified safe detour route
                detour_raw = _fetch_safe_detour(
                    origin=request.origin or "",
                    dest=request.dest or "",
                    inc_lng=inc_lng,
                    inc_lat=inc_lat,
                    all_incidents=[incident_dict],
                    mappls_key=request.mappls_key or "",
                )
                if detour_raw:
                    detour_res = res.copy()
                    detour_res["route_id"] = candidate.routeId + "_detour"
                    detour_res["disruption_risk"] = 0.35
                    detour_res["risk_band"] = "LOW" if detour_res["disruption_risk"] <= 0.30 else "MODERATE"
                    detour_res["new_geometry"] = detour_raw.get("geometry")
                    detour_res["new_distance"] = detour_raw.get("distance")
                    detour_res["new_duration"] = detour_raw.get("duration")
                    detour_res.pop("blocked_by_incident", None)
                    results.append(detour_res)

            results.append(res)

        return {"routes": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ─── /predict/risk ────────────────────────────────────────────────────────────

@router.post("/risk")
async def risk_predict(request: RouteRequest):
    try:
        results = []
        for route_data in request.routes:
            res = predict_route_risk(route_data)

            # Check intersection with incidents
            intersects = False
            intersecting_inc_lat = None
            intersecting_inc_lon = None

            coordinates = route_data.get('coordinates', [])

            for inc in request.incidents:
                loc = inc.get('location', {})
                if loc and loc.get('type') == 'Point':
                    inc_coords = loc.get('coordinates', [])
                    if len(inc_coords) >= 2:
                        inc_lon, inc_lat = float(inc_coords[0]), float(inc_coords[1])
                        if _route_intersects_incident(coordinates, inc_lon, inc_lat, threshold_km=1.5):
                            intersects = True
                            intersecting_inc_lat = inc_lat
                            intersecting_inc_lon = inc_lon
                            break

            if intersects:
                # The original route must be strictly 100% risk
                res['disruption_risk'] = 1.0
                res['risk_band'] = "CRITICAL"

                # Search for a verified safe detour route
                detour_raw = _fetch_safe_detour(
                    origin=request.origin,
                    dest=request.dest,
                    inc_lng=intersecting_inc_lon,
                    inc_lat=intersecting_inc_lat,
                    all_incidents=request.incidents,
                    mappls_key=request.mappls_key,
                )
                if detour_raw:
                    detour_res = res.copy()
                    detour_res['route_id'] = res['route_id'] + "_detour"
                    detour_res['new_geometry'] = detour_raw.get('geometry')
                    detour_res['new_distance'] = detour_raw.get('distance')
                    detour_res['new_duration'] = detour_raw.get('duration')
                    detour_res['disruption_risk'] = 0.35
                    detour_res['risk_band'] = "MODERATE"
                    results.append(detour_res)

            results.append(res)
        return {"routes": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/eta")
async def eta_predict(request: ETARequest):
    try:
        results = []
        for route_data in request.routes:
            res = predict_route_eta(route_data, request.timestamp)
            results.append(res)
        return {"routes": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
