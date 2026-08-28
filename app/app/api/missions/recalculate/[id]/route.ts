import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Mission } from "@/models/mission";
import { rerouteRoutesForIncident } from "@/lib/rerouteActiveRoutes";
import { Incident } from "@/models/incident";
import generateID from "@/utils/generateID";

const bodySchema = z.object({
  event_type: z.string().optional(),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  action: z.string().optional(),
});

/**
 * POST /api/missions/recalculate/[id]
 *
 * Called by ml/src/live/live_bridge.py when an incident is VERIFIED by CV/NLP.
 * Creates an incident document at the verified location and triggers automatic
 * rerouting for the specified mission.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;
    if (!missionId) {
      return NextResponse.json(
        { success: false, message: "Mission ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { latitude, longitude, severity } = parsed.data;

    await connectDB();

    // Verify the mission exists
    const mission = await Mission.findOne({ missionId }).lean();
    if (!mission) {
      return NextResponse.json(
        { success: false, message: `Mission ${missionId} not found` },
        { status: 404 }
      );
    }

    // Create a synthetic incident at the verified location
    const incident = await Incident.create({
      incidentId: generateID("I"),
      type: "OTHER",
      severity,
      location: { type: "Point", coordinates: [longitude, latitude] },
      description: `Verified incident near mission ${missionId} — auto-created by live bridge`,
      source: "API",
      status: "ACTIVE",
      missionId,
      occurredAt: new Date(),
    });

    // Trigger rerouting for the affected mission
    let rerouteResult: unknown = { affectedMissionCount: 0, missions: [] };
    try {
      rerouteResult = await rerouteRoutesForIncident(incident.incidentId);
    } catch (rerouteErr) {
      console.error("[recalculate] Reroute failed:", rerouteErr);
      rerouteResult = {
        success: false,
        message: "Incident created but rerouting failed",
        error: String(rerouteErr),
      };
    }

    return NextResponse.json({
      success: true,
      message: "Incident verified and rerouting triggered",
      incidentId: incident.incidentId,
      missionId,
      reroute: rerouteResult,
    });
  } catch (error) {
    console.error("Mission recalculate error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong during mission recalculation" },
      { status: 500 }
    );
  }
}
