
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { incidents } = body

  if (!incidents) {
    return NextResponse.json({
      success: false,
      message: "No incidents provided"
    }, { status: 400 })
  }

  for (const incident of incidents) {
    // run the ML model on the incident and then save it
    
  }

  return NextResponse.json({
    success: true,
    message: "Incidents synced successfully"
  })
}
