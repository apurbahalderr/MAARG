
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Route } from "@/models/routes";
import generateID from "@/utils/generateID";
import { verifyJWT } from "@/utils/verifyJWT";

const routeInputSchema = z.object({
  routeId: z.string().trim().min(1).optional(),
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(
      z.tuple([
        z.number().finite().min(-180).max(180),
        z.number().finite().min(-90).max(90),
      ])
    ).min(2),
  }),
  distanceMeters: z.number().finite().nonnegative(),
  durationSeconds: z.number().finite().nonnegative(),
  riskScore: z.number().finite().min(0).max(100).default(0),
  riskBand: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]).default("LOW"),
  triggeredByIncidentId: z.string().trim().min(1).optional(),
});

const chooseRouteSchema = z.object({
  missionId: z.string().trim().min(1),
  truckNo: z.string().trim().min(1),
  routes: z.array(routeInputSchema).min(1).max(3),
});

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = verifyJWT(request);
    if (!tokenPayload) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    if (!tokenPayload.roles.includes("admin")) {
      return NextResponse.json({ success: false, message: "Only admins can choose routes" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = chooseRouteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
  
    await connectDB();

    const latestRoute = await Route.findOne({ missionId: parsed.data.missionId })
      .sort({ routeVersion: -1 })
      .select("routeVersion")
      .lean();
    const routeVersion = (latestRoute?.routeVersion ?? 0) + 1;

    await Route.updateMany(
      { missionId: parsed.data.missionId, status: "ACTIVE" },
      { $set: { status: "SUPERSEDED" } }
    );

    const routes = await Route.insertMany(
      parsed.data.routes.map((route, index) => ({
        ...route,
        routeId: route.routeId ?? `${generateID("R")}-${index + 1}`,
        missionId: parsed.data.missionId,
        truckNo: parsed.data.truckNo,
        routeVersion,
        alternativeRank: index + 1,
        status: "ACTIVE",
      }))
    );

    return NextResponse.json(
      { success: true, message: "Routes saved successfully", routes },
      { status: 201 }
    );
  } catch (error) {
    console.error("Choose route error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while saving the route" },
      { status: 500 }
    );
  }
}