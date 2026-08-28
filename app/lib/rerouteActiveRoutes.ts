import { findRoute } from "@/lib/findGeometry";
import { connectDB } from "@/lib/connectDB";
import { Incident, IIncident } from "@/models/incident";
import { Mission } from "@/models/mission";
import { Route } from "@/models/routes";
import generateID from "@/utils/generateID";

const ROUTE_MATCH_RADIUS_METERS = 500;
const MAX_ALTERNATIVES = 3;

type Coordinate = [number, number];

type CandidateRoute = {
  routeId: string;
  geometry: {
    type: "LineString";
    coordinates: Coordinate[];
  };
  distanceMeters: number;
  durationSeconds: number;
};

type MLRouteResult = {
  route_id: string;
  disruption_risk: number;
  risk_band: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  // Optional: present on waypoint-detour routes added by ML when a route is blocked
  new_geometry?: { type: string; coordinates: Coordinate[] };
  new_distance?: number;
  new_duration?: number;
  blocked_by_incident?: string;
};

function extractCandidates(raw: unknown): CandidateRoute[] {
  const response = raw as {
    routes?: Array<{
      geometry?: { coordinates?: unknown };
      distance?: unknown;
      duration?: unknown;
    }>;
    trip?: Record<string, unknown>;
    alternates?: Array<{ trip?: Record<string, unknown> }>;
  };
  if (Array.isArray(response.routes)) {
    return response.routes.slice(0, MAX_ALTERNATIVES).map((route, index) => {
      const coordinates = route.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        throw new Error(`Mappls route ${index + 1} has no usable GeoJSON geometry`);
      }

      const normalizedCoordinates = coordinates.map((coordinate) => {
        if (
          !Array.isArray(coordinate) ||
          coordinate.length < 2 ||
          typeof coordinate[0] !== "number" ||
          typeof coordinate[1] !== "number"
        ) {
          throw new Error(`Mappls route ${index + 1} contains invalid coordinates`);
        }
        return [coordinate[0], coordinate[1]] as Coordinate;
      });

      return {
        routeId: index === 0 ? "primary" : `alternative_${index}`,
        geometry: { type: "LineString", coordinates: normalizedCoordinates },
        distanceMeters: Number(route.distance ?? 0),
        durationSeconds: Number(route.duration ?? 0),
      };
    });
  }

  const trips = [
    response.trip,
    ...(response.alternates ?? []).map((alternate) => alternate.trip),
  ].filter((trip): trip is Record<string, unknown> => Boolean(trip));

  return trips.slice(0, MAX_ALTERNATIVES).map((trip, index) => {
    const geometry = trip.geometry as { coordinates?: unknown } | undefined;
    const coordinates = geometry?.coordinates;

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      throw new Error(`Mappls route ${index + 1} has no usable GeoJSON geometry`);
    }

    const normalizedCoordinates = coordinates.map((coordinate) => {
      if (
        !Array.isArray(coordinate) ||
        coordinate.length < 2 ||
        typeof coordinate[0] !== "number" ||
        typeof coordinate[1] !== "number"
      ) {
        throw new Error(`Mappls route ${index + 1} contains invalid coordinates`);
      }
      return [coordinate[0], coordinate[1]] as Coordinate;
    });

    const summary = (trip.summary ?? {}) as {
      length?: unknown;
      time?: unknown;
    };

    return {
      routeId: index === 0 ? "primary" : `alternative_${index}`,
      geometry: { type: "LineString", coordinates: normalizedCoordinates },
      distanceMeters: Number(summary.length ?? 0),
      durationSeconds: Number(summary.time ?? 0),
    };
  });
}

async function scoreCandidates(
  incident: IIncident,
  candidates: CandidateRoute[],
  origin: string,
  dest: string
): Promise<MLRouteResult[]> {
  const mlUrl = process.env.ML_SERVICE_URL ?? process.env.ML_API_URL ?? "http://localhost:8001";
  const mapplsKey = process.env.MAPPLS_KEY ?? "";
  const response = await fetch(`${mlUrl}/predict/reroute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      incident: {
        incident_id: incident.incidentId,
        type: incident.type,
        severity: incident.severity,
        location: incident.location,
        occurred_at: incident.occurredAt.toISOString(),
      },
      routes: candidates,
      origin,
      dest,
      mappls_key: mapplsKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`ML reroute request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { routes?: MLRouteResult[] };
  if (!Array.isArray(data.routes) || data.routes.length === 0) {
    throw new Error("ML reroute response returned no scored routes");
  }
  return data.routes;
}

async function rerouteMission(incident: IIncident, missionId: string) {
  const mission = await Mission.findOne({ missionId }).lean();
  if (!mission) {
    console.warn(`Skipping reroute: mission ${missionId} was not found`);
    return;
  }

  const rawMapplsResponse = await findRoute({
    origin: mission.origin,
    dest: mission.destination,
  });

  if ("error" in rawMapplsResponse) {
    throw new Error(rawMapplsResponse.detail);
  }

  const candidates = extractCandidates(rawMapplsResponse);
  if (candidates.length === 0) {
    throw new Error(`Mappls returned 0 routes; expected 1-${MAX_ALTERNATIVES}`);
  }
  if (candidates.length > MAX_ALTERNATIVES) {
    candidates.splice(MAX_ALTERNATIVES);
  }

  // Pass mission origin/dest so ML can generate waypoint detours for blocked routes
  const scores = await scoreCandidates(incident, candidates, mission.origin, mission.destination);

  const latestRoute = await Route.findOne({ missionId })
    .sort({ routeVersion: -1 })
    .select("routeVersion")
    .lean();
  const nextVersion = (latestRoute?.routeVersion ?? 0) + 1;

  await Route.updateMany(
    { missionId, status: "ACTIVE" },
    { $set: { status: "SUPERSEDED" } }
  );

  // ML may return more routes than candidates (detour routes are appended)
  // Build a map from routeId to its original candidate for geometry fallback
  const candidateMap = new Map(candidates.map((c) => [c.routeId, c]));

  const routeDocuments = scores.map((score, index) => {
    // Find original candidate geometry; for detour routes (_detour suffix), use the ML-provided new geometry
    const baseRouteId = score.route_id.replace(/_detour$/, "");
    const original = candidateMap.get(baseRouteId) ?? candidates[0];
    const isDetour = score.route_id.endsWith("_detour");

    // Detour routes come with new geometry from Mappls via waypoint; use that if available
    const geometry = isDetour && score.new_geometry
      ? score.new_geometry
      : original.geometry;
    const distanceMeters = isDetour && score.new_distance
      ? score.new_distance
      : original.distanceMeters;
    const durationSeconds = isDetour && score.new_duration
      ? score.new_duration
      : original.durationSeconds;

    return {
      routeId: `${generateID("R")}-${index + 1}`,
      missionId,
      truckNo: mission.truckNo,
      routeVersion: nextVersion,
      alternativeRank: index + 1,
      geometry,
      distanceMeters,
      durationSeconds,
      riskScore: Math.round(score.disruption_risk * 100),
      riskBand: score.risk_band,
      status: "ACTIVE" as const,
      triggeredByIncidentId: incident.incidentId,
    };
  });

  await Route.insertMany(routeDocuments);

  return { missionId, routeVersion: nextVersion, routeCount: routeDocuments.length };
}

export async function rerouteRoutesForIncident(incidentId: string) {
  await connectDB();

  const incident = await Incident.findOne({ incidentId }).lean();
  if (!incident) throw new Error(`Incident ${incidentId} was not found`);

  const affectedRoutes = await Route.find({
    status: "ACTIVE",
    geometry: {
      $near: {
        $geometry: incident.location,
        $maxDistance: ROUTE_MATCH_RADIUS_METERS,
      },
    },
  })
    .select("missionId")
    .lean();

  const missionIds = [...new Set(affectedRoutes.map((route) => route.missionId))];
  const rerouted = [];
  for (const missionId of missionIds) {
    rerouted.push(await rerouteMission(incident, missionId));
  }

  return { affectedMissionCount: rerouted.length, missions: rerouted };
}
