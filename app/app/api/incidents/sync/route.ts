
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Incident } from "@/models/incident";
import generateID from "@/utils/generateID";

const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8001";

const incidentItemSchema = z.object({
  type: z.enum([
    "LANDSLIDE", "FLOOD", "ROAD_BLOCK", "ROAD_DAMAGE",
    "BRIDGE_DAMAGE", "ACCIDENT", "TRAFFIC", "OTHER",
  ]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.object({
    coordinates: z.tuple([
      z.number().finite().min(-180).max(180),
      z.number().finite().min(-90).max(90),
    ]),
  }),
  description: z.string().trim().max(2000).optional(),
  occurredAt: z.coerce.date(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidents } = body;

    if (!Array.isArray(incidents) || incidents.length === 0) {
      return NextResponse.json(
        { success: false, message: "No incidents provided" },
        { status: 400 }
      );
    }

    await connectDB();

    const results = { saved: 0, skipped: 0, errors: [] as string[] };

    for (const rawIncident of incidents) {
      // 1. Validate schema
      const parsed = incidentItemSchema.safeParse(rawIncident);
      if (!parsed.success) {
        results.errors.push(`Validation failed: ${JSON.stringify(parsed.error.flatten())}`);
        results.skipped++;
        continue;
      }

      const data = parsed.data;

      // 2. Call ML incident verification (non-blocking: save if ML unavailable)
      let mlVerified = true;
      try {
        const description = data.description || `${data.type} incident with ${data.severity} severity`;
        const formData = new FormData();
        formData.append("text", description);

        const mlRes = await fetch(`${ML_API_URL}/api/v1/incidents/report`, {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(15000),
        });

        if (mlRes.ok) {
          const mlData = await mlRes.json();
          // Only reject if ML explicitly rejects (REJECTED status, not UNCERTAIN)
          if (mlData?.final_decision?.is_rejected === true) {
            mlVerified = false;
          }
        }
      } catch (mlErr) {
        console.warn("[/api/incidents/sync] ML verification unavailable, saving anyway:", mlErr);
      }

      if (!mlVerified) {
        results.skipped++;
        continue;
      }

      // 3. Save to MongoDB
      try {
        await Incident.create({
          incidentId: generateID("I"),
          type: data.type,
          severity: data.severity,
          location: { type: "Point", coordinates: data.location.coordinates },
          description: data.description,
          occurredAt: data.occurredAt,
          source: "API",
          status: "ACTIVE",
        });
        results.saved++;
      } catch (dbErr) {
        results.errors.push(`DB save failed: ${String(dbErr)}`);
        results.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Incidents synced: ${results.saved} saved, ${results.skipped} skipped`,
      results,
    });
  } catch (error) {
    console.error("Incidents sync error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong during incident sync" },
      { status: 500 }
    );
  }
}
