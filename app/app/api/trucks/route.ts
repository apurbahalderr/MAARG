import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import { User } from "@/models/user";
import { verifyJWT } from "@/utils/verifyJWT";

export async function GET(req: NextRequest) {
  try {
    const tokenPayload = verifyJWT(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const drivers = await User.find({
      roles: "driver",
      isActive: true,
      "driverProfile.truckNo": { $exists: true, $ne: "" }
    })
      .select("name driverProfile.truckNo driverProfile.status")
      .lean();

    const trucks = drivers.map((d) => ({
      driverName: d.name,
      truckNo: d.driverProfile?.truckNo,
      status: d.driverProfile?.status || "available",
    }));

    return NextResponse.json({ success: true, trucks });
  } catch (error) {
    console.error("Get trucks error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while fetching trucks" },
      { status: 500 }
    );
  }
}
