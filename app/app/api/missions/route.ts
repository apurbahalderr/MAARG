

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/connectDB";
import { Mission } from "@/models/mission";
import { verifyJWT } from "@/utils/verifyJWT";

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

    await connectDB();
    const mission = await Mission.create(parsed.data);

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