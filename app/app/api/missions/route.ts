import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Mission } from "@/models/mission";
import { verifyJWT } from "@/utils/verifyJWT";
import generateID from "@/utils/generateID";
import { User } from "@/models/user";
import { Route } from "@/models/routes";

// GET /api/missions — admin lists all missions (optional ?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED)
export async function GET(req: NextRequest) {
  try {
    const tokenPayload = verifyJWT(req);
    if (!tokenPayload) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }
    if (!tokenPayload.roles.includes("admin")) {
      return NextResponse.json({ success: false, message: "Only admins can list all missions" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const filter = status ? { status } : {};

    const missions = await Mission.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, missions });
  } catch (error) {
    console.error("List missions error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while fetching missions" },
      { status: 500 }
    );
  }
}

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

const createMissionSchema = z.object({
  truckNo: z.string().trim().min(1, "Truck number is required"),
  cargoType: z.enum([
    "MEDICAL",
    "FOOD",
    "FUEL",
    "AGRICULTURAL",
    "CONSTRUCTION",
    "RELIEF",
    "GENERAL",
  ]),
  cargoQuantity: z.string().trim().min(1, "Cargo quantity is required"),
  origin: z.string().trim().min(1, "Origin is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  originAddress: z.string().trim().max(500).optional(),
  destinationAddress: z.string().trim().max(500).optional(),
  targetArrival: z.coerce.date(),
  routes: z.array(routeInputSchema).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const tokenPayload = verifyJWT(req);

    if (!tokenPayload) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    if (!tokenPayload.roles.includes("admin")) {
      return NextResponse.json({ success: false, message: "Only admins can create missions" }, { status: 403 });
    }

    const body = await req.json();

    if (!body) {
      return NextResponse.json({ success: false, message: "Request body is required" }, { status: 400 });
    }

    const parsed = createMissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const missionId = generateID("M")

    await connectDB();

    const driverId = await User.findOne({ "driverProfile.truckNo": parsed.data.truckNo }).select("_id").lean(); // finding the driverId based on the truckNo provided

    if (!driverId) {
      return NextResponse.json(
        { success: false, message: "No driver found for the provided truck number" },
        { status: 404 }
      );
    }

    const { routes, ...missionData } = parsed.data;
    const mission = await Mission.create({ ...missionData, missionId, driverId: driverId._id });

    if (routes && routes.length > 0) {
      const latestRoute = await Route.findOne({ missionId })
        .sort({ routeVersion: -1 })
        .select("routeVersion")
        .lean();
      const routeVersion = (latestRoute?.routeVersion ?? 0) + 1;

      await Route.updateMany(
        { missionId, status: "ACTIVE" },
        { $set: { status: "SUPERSEDED" } }
      );

      await Route.insertMany(
        routes.map((route, index) => ({
          ...route,
          routeId: route.routeId ?? `${generateID("R")}-${index + 1}`,
          missionId,
          truckNo: parsed.data.truckNo,
          routeVersion,
          alternativeRank: index + 1,
          status: "ACTIVE",
        }))
      );
    }

    return NextResponse.json(
      { success: true, message: "Mission created successfully", mission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create mission error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while creating the mission" },
      { status: 500 }
    );
  }
}