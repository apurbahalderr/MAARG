// app/api/route/route.ts
import { NextResponse } from "next/server";

interface Coordinates {
  origin: string;
  dest: string;
}

export async function GET(req: Request) {

 const MAPPLS_KEY = process.env.MAPPLS_KEY;

if (!MAPPLS_KEY) {
  throw new Error("MAPPLS_KEY is missing");
}

const {origin, dest} = await req.json() as Coordinates;

const url =
  `https://route.mappls.com/route/direction/` +
  `route_adv/trucking/${origin};${dest}` +
  `?geometries=geojson` +
  `&alternatives=3` +
  `&steps=true` +
  `&access_token=${MAPPLS_KEY}`;

  try {
    
    const response = await fetch(url);
    
    console.log("STATUS:", response.status);
    
    const data = await response.json();
    
    console.log(data);

    // will call ML end point
    // ml will send with route number and their severity
    // 
    // append the severity to the data of all three routes

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Mappls request failed", detail: errText },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error calling Mappls", detail: String(err) },
      { status: 500 }
    );
  }
}