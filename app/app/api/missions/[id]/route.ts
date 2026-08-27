import { connectDB } from "@/lib/connectDB";
import { Mission } from "@/models/mission";
import { NextRequest } from "next/server";


// this api route is used to get a single mission by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;

        if (!id) {
            return new Response(JSON.stringify({ success: false, message: "Mission ID is required" }), { status: 400 });
        }

        await connectDB();

        const mission = await Mission.findOne({ missionId: id }).
            lean();

        if (!mission) {
            return new Response(JSON.stringify({ success: false, message: "Mission not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, mission }), { status: 200 });

    } catch (error) {
        console.error("Get mission by ID error:", error);
        return new Response(JSON.stringify({ success: false, message: "Something went wrong while fetching the mission" }), { status: 500 });
    }
  
}
