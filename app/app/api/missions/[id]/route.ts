import { NextRequest } from "next/server";


// this api route is used to get a single mission by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // const 
  
  
}
