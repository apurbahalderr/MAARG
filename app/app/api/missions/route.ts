import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Mission } from "@/models/mission";
import { verifyJWT } from "@/utils/verifyJWT";
import generateID from "@/utils/generateID";
import { User } from "@/models/user";

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
  targetArrival: z.coerce.date(),
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

    const mission = await Mission.create({ ...parsed.data, missionId, driverId: driverId._id });

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