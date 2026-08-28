
import { VehicleLoc } from "@/models/VehicleLoc";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/utils/verifyJWT";
import { connectDB } from "@/lib/connectDB";

const truckLocationSchema = z.object({
  truckNo: z.string().trim().min(1).optional(),
  missionId: z.string().trim().min(1).optional(),
  location: z.object({
    type: z.literal("Point").optional().default("Point"),
    coordinates: z.tuple([
      z.number().finite().min(-180).max(180),
      z.number().finite().min(-90).max(90),
    ]),
  }),
  speed: z.number().finite().min(0).optional(),
  heading: z.number().finite().min(0).max(360).optional(),
  timestamp: z.coerce.date().optional(),
});

// update the location of the driver
export async function POST(req: NextRequest, {params} : {params: Promise<{truckNo: string}>}) {
  const tokenPayload = verifyJWT(req);
  if (!tokenPayload) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const { truckNo } = (await params)
  const rawBody = await req.json().catch(() => null);
  if (!rawBody) {
    return NextResponse.json({ success: false, message: "Request body is required" }, { status: 400 });
  }

  const parsed = truckLocationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed", errors: parsed.error.flatten() }, { status: 400 });
  }

  const normalizedTruckNo = (parsed.data.truckNo ?? truckNo).toUpperCase().trim();
  if (normalizedTruckNo !== truckNo.toUpperCase().trim()) {
    return NextResponse.json({ success: false, message: "Truck number in URL and body must match" }, { status: 400 });
  }

  await connectDB();

  const updateDoc: Record<string, unknown> = {
    truckNo: normalizedTruckNo,
    location: {
      type: "Point",
      coordinates: parsed.data.location.coordinates,
    },
    timestamp: parsed.data.timestamp ?? new Date(),
  };
  if (parsed.data.missionId) updateDoc.missionId = parsed.data.missionId;
  if (parsed.data.speed !== undefined) updateDoc.speed = parsed.data.speed;
  if (parsed.data.heading !== undefined) updateDoc.heading = parsed.data.heading;

  const veh = await VehicleLoc.findOneAndUpdate({ truckNo: normalizedTruckNo }, updateDoc, { new: true, upsert: true })

  return NextResponse.json({
    success: true,
    message: "Vehicle location updated successfully",
    data: veh,
  });
}

// get the location of the driver
export async function GET(req: NextRequest, {params} : {params: Promise<{truckNo: string}>}) {
  const tokenPayload = verifyJWT(req);
  if (!tokenPayload) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const { truckNo } = (await params)
  await connectDB();
  const veh = await VehicleLoc.findOne({ truckNo: truckNo.toUpperCase().trim() })

  if (!veh) {
    return NextResponse.json({
      success: false,
      message: "No vehicle exists for the provided truck number"
    }, {status: 404})
  }

  return NextResponse.json({
    success: true,
    message: "Vehicle location retrieved successfully",
    data: veh,
  });
}
