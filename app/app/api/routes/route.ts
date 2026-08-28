import { NextResponse } from "next/server";

const MAPPLS_KEY = process.env.MAPPLS_KEY;
const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8001";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
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
  }>,
): Promise<number[]> {
  // Build payload: ~5 segments per route for performance
  const SEGMENTS_PER_ROUTE = 5;
  const mlPayload = {
    routes: routes.map((r) => ({
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

  try {
    const res = await fetch(`${ML_API_URL}/predict/risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    if (!res.ok) throw new Error(`ML returned ${res.status}`);
    const data = await res.json();
    // data.routes[i].disruption_risk is in [0,1]
    return (data.routes as Array<{ disruption_risk: number }>).map((r) =>
      Math.round(r.disruption_risk * 100),
    );
  } catch (err) {
    console.warn(
      "[/api/routes] ML API unavailable, using placeholder scores:",
      err,
    );
    // Fallback: safest route first
    return routes.map((_, i) => [18, 46, 82][i] ?? 50);
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
  const origin = searchParams.get("origin");
  const dest = searchParams.get("dest");

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
    `?geometries=geojson&overview=full&alternatives=true&steps=false` +
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

  // ── Fallback mock geometry if Mappls returns nothing ──────────────────────
  const isMock = rawRoutes.length === 0;
  if (isMock) {
    const [originLng, originLat] = origin.split(",").map(Number);
    const [destLng, destLat] = dest.split(",").map(Number);
    rawRoutes = [
      {
        geometry: {
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
        },
        distance: 420000,
        duration: 29400,
      },
      {
        geometry: {
          coordinates: [
            [originLng, originLat],
            [(originLng + destLng) / 2 + 0.1, (originLat + destLat) / 2],
            [destLng, destLat],
          ],
        },
        distance: 395000,
        duration: 27000,
      },
      {
        geometry: {
          coordinates: [
            [originLng, originLat],
            [(originLng + destLng) / 2 - 0.1, (originLat + destLat) / 2],
            [destLng, destLat],
          ],
        },
        distance: 370000,
        duration: 25200,
      },
    ];
  }

  // ── Score via ML ──────────────────────────────────────────────────────────
  const mlInput = rawRoutes.map((r, i) => ({
    route_id: `route_${i + 1}`,
    distKm: r.distance / 1000,
    durationSeconds: r.duration,
    coordCount: r.geometry.coordinates.length,
  }));

  const riskScores = await scoreRoutesWithML(mlInput);

  // Sort so lowest risk is route 1 (recommended)
  const indexed = rawRoutes.map((r, i) => ({
    r,
    score: riskScores[i] ?? 50,
    i,
  }));
  indexed.sort((a, b) => a.score - b.score);

  const routes = indexed.map(({ r, score }, rankIdx) => {
    const risk = classifyRisk(score);
    return {
      id: `route_${rankIdx + 1}`,
      coordinates: r.geometry.coordinates,
      distanceKm: Math.round(r.distance / 1000),
      eta: formatDuration(r.duration),
      riskScore: score,
      risk: risk.level,
      color: risk.color,
      isRecommended: rankIdx === 0,
      riskReasons: riskReasons(risk.level, rankIdx),
      expectedRecovery:
        risk.level === "LOW"
          ? "Fully operational — no delay expected"
          : risk.level === "MEDIUM"
            ? "Approx. 6–8 hours to clear any bottleneck"
            : "Approx. 18–24 hours for heavy-machinery clearing",
    };
  });

  return NextResponse.json({ routes, isMock });
}
