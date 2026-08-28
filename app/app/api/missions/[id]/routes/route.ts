import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { Route } from "@/models/routes";
import { verifyJWT } from "@/utils/verifyJWT";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenPayload = verifyJWT(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Mission ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Return all ACTIVE routes for this mission, sorted by alternativeRank
    const routes = await Route.find({ missionId: id, status: "ACTIVE" })
      .sort({ routeVersion: -1, alternativeRank: 1 })
      .lean();

    return NextResponse.json({ success: true, missionId: id, routes });
  } catch (error) {
    console.error("Get mission routes error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while fetching mission routes" },
      { status: 500 }
    );
  }
}
