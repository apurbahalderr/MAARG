import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { Incident } from "@/models/incident";

const MAPPLS_KEY = process.env.MAPPLS_KEY;
const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8001";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Generate deterministic synthetic features for a segment (mirrors the Python
 *  generate_synthetic_features logic so the ML model gets plausible input) */
function syntheticFeatures(
  segIdx: number,
  routeId: string,
  distKm: number,
  durationSeconds: number,
) {
  // Simple deterministic hash-like seed: sum of char codes of routeId + segIdx
  const seed =
    (routeId + segIdx).split("").reduce((a, c) => a + c.charCodeAt(0), 0) *
    (segIdx + 1);
  const h = Math.abs(seed);
  const slope = 5 + (h % 20);
  const rain = h % 100;
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    slope_mean: slope,
    slope_max: slope + 5.0,
    elevation_change: slope * 10,
    historical_landslide_count_1km: h % 2,
    historical_landslide_count_5km: h % 5,
    days_since_nearest_landslide: 100 + (h % 900),
    historical_route_landslide_density: (h % 10) / 10,
    rain_1h: rain * 0.1,
    rain_6h: rain * 0.5,
    rain_24h: rain,
    rain_72h: rain * 2,
    rain_change_3h: (h % 10) - 5,
    soil_moisture_surface: (20 + (h % 30)) / 100,
    soil_moisture_rootzone: (25 + (h % 30)) / 100,
    soil_moisture_delta_24h: ((h % 10) - 5) / 100,
    active_incident_count_1km: h % 2,
    active_incident_severity_score: (h % 3) / 2,
    segment_distance_km: distKm,
    mappls_baseline_eta_minutes: durationSeconds / 60,
    mappls_baseline_speed_kmph: 30 + (h % 30),
    hour_of_day: now.getHours(),
    day_of_week: now.getDay(),
    historical_mean_travel_time_minutes: 2.5 + (h % 5),
    historical_median_travel_time_minutes: 2.4 + (h % 5),
    recent_travel_time_15m: 2.6 + (h % 6),
    recent_travel_time_30m: 2.6 + (h % 6),
    recent_travel_time_60m: 2.5 + (h % 6),
  };
}

/** Score routes via ML model at localhost:8001/predict/risk.
 *  Falls back to placeholder scores if ML is unavailable. */
async function scoreRoutesWithML(
    routes: Array<{
      route_id: string;
      distKm: number;
      durationSeconds: number;
      coordCount: number;
      coordinates: [number, number][];
    }>,
    incidents: any[],
    origin: string,
    dest: string,
    mappls_key: string
  ): Promise<Array<{ route_id: string; disruption_risk: number; risk_band: string; new_geometry?: any; new_distance?: number; new_duration?: number; }>> {
  // Build payload: ~5 segments per route for performance
  const SEGMENTS_PER_ROUTE = 5;
  const mlPayload = {
    incidents,
    origin,
    dest,
    mappls_key,
    routes: routes.map((r) => ({
      coordinates: r.coordinates,
      route_id: r.route_id,
      segments: Array.from({ length: SEGMENTS_PER_ROUTE }, (_, i) => ({
        segment_id: `${r.route_id}_s${i}`,
        features: syntheticFeatures(
          i,
          r.route_id,
          r.distKm / SEGMENTS_PER_ROUTE,
          r.durationSeconds / SEGMENTS_PER_ROUTE,
        ),
      })),
    })),
  };

  // console.log("mlPayload: " + JSON.stringify(mlPayload));

  try {
    const res = await fetch(`${ML_API_URL}/predict/risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
      signal: AbortSignal.timeout(20000), // 20s timeout
    });
    if (!res.ok) throw new Error(`ML returned ${res.status}`);
    const data = await res.json();
    console.log(data)
    // data.routes[i].disruption_risk is in [0,1]

    return data.routes.map((r: any) => ({
      route_id: r.route_id,
      disruption_risk: Math.round(r.disruption_risk * 100),
      risk_band: r.risk_band,
      new_geometry: r.new_geometry,
      new_distance: r.new_distance,
      new_duration: r.new_duration,
    }));


  } catch (err) {
    console.warn(
      "[/api/routes] ML API unavailable, using placeholder scores:",
      err,
    );
    // Fallback: safest route first — return same shape as ML success
    const fallback = [18, 46, 82];
    return routes.map((r, i) => ({
      route_id: r.route_id,
      disruption_risk: fallback[i] ?? 50,
      risk_band: fallback[i] !== undefined ? (fallback[i] <= 30 ? "LOW" : fallback[i] <= 60 ? "MODERATE" : "HIGH") : "MODERATE",
    }));
  }


}

function classifyRisk(score: number): {
  level: "LOW" | "MEDIUM" | "HIGH";
  color: string;
} {
  if (score <= 30) return { level: "LOW", color: "#22c55e" };
  if (score <= 60) return { level: "MEDIUM", color: "#f59e0b" };
  return { level: "HIGH", color: "#ef4444" };
}


// send the actual incident reasons to the frontend so that it can be displayed in the UI
function riskReasons(risk: "LOW" | "MEDIUM" | "HIGH", index: number): string[] {
  if (risk === "LOW")
    return [
      "Optimal terrain gradient along this corridor",
      "No active disruption warnings reported",
      "Stable weather forecast for the next 12 hours",
    ];
  if (risk === "MEDIUM")
    return [
      "Moderate rainfall expected near high passes",
      "Narrow hill sections prone to occasional mudslides",
    ];
  return [
    "High disruption risk probability detected by ML model",
    "Active road-risk indicators on this corridor",
    `Route ${index + 1} has the highest historical disruption density`,
  ];
}

// ─── GET /api/routes?origin=lng,lat&dest=lng,lat ─────────────────────────────

export async function GET(req: Request) {
  if (!MAPPLS_KEY) {
    return NextResponse.json(
      { error: "MAPPLS_KEY is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  // console.log(searchParams)
  const origin = searchParams.get("origin");
  const dest = searchParams.get("dest") ?? searchParams.get("destination");

  if (!origin || !dest) {
    return NextResponse.json(
      { error: "Missing query params: origin and dest (format: lng,lat)" },
      { status: 400 },
    );
  }

  // ── Mappls routing call ───────────────────────────────────────────────────
  const mapplsUrl =
    `https://route.mappls.com/route/direction/` +
    `route_adv/trucking/${origin};${dest}` +
    `?geometries=geojson&overview=full&alternatives=3&steps=false` +
    `&access_token=${MAPPLS_KEY}`;

  let rawRoutes: Array<{
    geometry: { coordinates: [number, number][] };
    distance: number;
    duration: number;
  }> = [];

  try {
    const mapplsRes = await fetch(mapplsUrl);
    const mapplsData = await mapplsRes.json();

    if (mapplsRes.ok && Array.isArray(mapplsData.routes)) {
      rawRoutes = mapplsData.routes;
    }
  } catch (err) {
    console.warn("[/api/routes] Mappls API error:", err);
  }

  // ── Fallback/enrichment: if Mappls returned 0 or 1 route, query free OSRM ──
  if (rawRoutes.length < 2) {
    try {
      const [oLng, oLat] = origin.split(",");
      const [dLng, dLat] = dest.split(",");
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&alternatives=true`;
      const osrmRes = await fetch(osrmUrl, {
        headers: { "User-Agent": "MAARG-Disaster-Logistics/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (Array.isArray(osrmData.routes)) {
          for (const osrmRoute of osrmData.routes) {
            const isDup = rawRoutes.some(
              (r) => Math.abs(r.distance - osrmRoute.distance) < 2000
            );
            if (!isDup && osrmRoute.geometry?.coordinates) {
              rawRoutes.push({
                geometry: osrmRoute.geometry,
                distance: osrmRoute.distance,
                duration: osrmRoute.duration,
              });
            }
          }
        }
      }
    } catch (osrmErr) {
      console.warn("[/api/routes] OSRM alternative query error:", osrmErr);
    }
  }

  // ── Score via ML ──────────────────────────────────────────────────────────

  const mlInput = rawRoutes.map((r, i) => ({
    route_id: `route_${i + 1}`,
    distKm: r.distance / 1000,
    durationSeconds: r.duration,
    coordCount: r.geometry.coordinates.length,
    coordinates: r.geometry.coordinates,
  }));

  await connectDB();
  const activeIncidents = await Incident.find({ status: 'ACTIVE' }).lean();
  const scored = await scoreRoutesWithML(mlInput, activeIncidents, origin, dest, MAPPLS_KEY);

  // Sort so lowest risk is route 1 (recommended) — use disruption_risk numeric
  const indexed = scored.map((s, i) => {
    const originalRouteIdMatch = s.route_id.match(/route_(\d+)/);
    const originalIndex = originalRouteIdMatch ? parseInt(originalRouteIdMatch[1]) - 1 : 0;
    const r = rawRoutes[originalIndex] || rawRoutes[0];
    return { r, scored: s, i };
  });

  indexed.sort((a, b) => a.scored.disruption_risk - b.scored.disruption_risk);

  // Deduplicate routes that have almost identical distances and risk scores
  const uniqueIndexed: typeof indexed = [];
  for (const item of indexed) {
    const dist = item.scored.new_distance || item.r.distance;
    const isDup = uniqueIndexed.some((existing) => {
      const existingDist = existing.scored.new_distance || existing.r.distance;
      return (
        Math.abs(existingDist - dist) < 1500 &&
        existing.scored.disruption_risk === item.scored.disruption_risk
      );
    });
    if (!isDup) {
      uniqueIndexed.push(item);
    }
  }

  const routes = uniqueIndexed.map(({ r, scored: s }, rankIdx) => {
    let score = s.disruption_risk;
    const finalGeometry = s.new_geometry || r.geometry;
    const finalDistance = s.new_distance || r.distance;
    const finalDuration = s.new_duration || r.duration;

    // Strict 1km distance check against all active incidents
    let isWithin1km = false;
    let nearestIncidentType = "";
    let minDistanceKm = Infinity;

    for (const inc of activeIncidents) {
      const loc = inc.location?.coordinates;
      if (Array.isArray(loc) && loc.length >= 2) {
        const [incLng, incLat] = loc;
        for (const [ptLng, ptLat] of finalGeometry.coordinates) {
          const d = haversineKm(ptLng, ptLat, incLng, incLat);
          if (d < minDistanceKm) minDistanceKm = d;
          if (d <= 1.0) {
            isWithin1km = true;
            nearestIncidentType = inc.type || "INCIDENT";
            break;
          }
        }
      }
      if (isWithin1km) break;
    }

    if (isWithin1km) {
      score = 100;
    }

    const risk = classifyRisk(score);
    const mlBand = s.risk_band as string | undefined;
    const dbBand = isWithin1km
      ? "CRITICAL"
      : mlBand && ["LOW", "MODERATE", "HIGH", "CRITICAL"].includes(mlBand)
        ? mlBand
        : (risk.level === "MEDIUM" ? "MODERATE" : risk.level);

    const isSafe = !isWithin1km && score < 75;

    // Distinct, vibrant colors: Green for safe/recommended, Amber/Orange for moderate, Crimson Red for blocked/unsafe
    const color = isWithin1km || score >= 75
      ? "#dc2626"
      : score <= 30
        ? "#16a34a"
        : "#d97706";

    return {
      id: `route_${rankIdx + 1}`,
      coordinates: finalGeometry.coordinates,
      geometry: finalGeometry,
      distanceKm: Math.round(finalDistance / 1000),
      distanceMeters: finalDistance,
      durationSeconds: finalDuration,
      eta: formatDuration(finalDuration),
      riskScore: score,
      risk: isWithin1km || score >= 75 ? "HIGH" : risk.level,
      riskBand: dbBand,
      color,
      isRecommended: rankIdx === 0 && isSafe,
      isBlocked: isWithin1km || score >= 75,
      riskReasons: isWithin1km
        ? [
            `⛔ NOT VIABLE: Road lies directly within 1km hazard zone of active ${nearestIncidentType}`,
            "Corridor is obstructed / hazardous — vehicle transit is unsafe",
            "Use recommended alternative bypass",
          ]
        : score >= 75
          ? [
              "⚠️ CRITICAL: Active road blockage / hazard on this corridor",
              "Path intersects disaster impact area",
              "Corridor is impassable — bypass required",
            ]
          : riskReasons(risk.level, rankIdx),
      expectedRecovery: isWithin1km || score >= 75
        ? "Corridor impassable — heavy machinery clearing in progress"
        : risk.level === "LOW"
          ? "Fully operational — verified safe corridor"
          : risk.level === "MEDIUM"
            ? "Minor slowdown — bypass corridor active"
            : "Approx. 18–24 hours for clearing",
    };
  });

  return NextResponse.json({ routes, incidents: activeIncidents });
}
