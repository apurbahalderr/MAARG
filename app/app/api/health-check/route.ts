import { NextResponse } from "next/server";


export async function GET() {
  return NextResponse.json({
    msg: "Health is good and fine"
  }, {status: 200})
}