
// update the location of the driver

import { VehicleLoc } from "@/models/VehicleLoc";
import { NextRequest, NextResponse } from "next/server";


// update the location of the driver

export async function POST(req: NextRequest, {params} : {params: Promise<{truckNo: string}>}) {
  const { truckNo } = (await params)
  const body = await req.json()


  const veh = await VehicleLoc.findOneAndUpdate({ truckNo }, body, { new: true, upsert: true }) // if the truck has no prev records then create a new one

  return NextResponse.json({
    success: true,
    message: "Vehicle location updated successfully",
    data: veh
  })
}


// get the location of the driver
export async function GET(req: NextRequest, {params} : {params: Promise<{truckNo: string}>}) {
  const { truckNo } = (await params)
  const veh = await VehicleLoc.findOne({ truckNo })

  if (!veh) {
    return NextResponse.json({
      success: false,
      message: "No vechile exist for the provided truck number"
    }, {status: 404})
  }

  return NextResponse.json({
    success: true,
    message: "Vehicle location retrieved successfully",
    data: veh
  })
}
