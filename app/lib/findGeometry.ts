// app/api/route/route.ts

interface Coordinates {
  origin: string;
  dest: string;
}

export async function findRoute(req: Coordinates) {

 const MAPPLS_KEY = process.env.MAPPLS_KEY;

if (!MAPPLS_KEY) {
  throw new Error("MAPPLS_KEY is missing");
}

const {origin, dest} = req;

// fetches 3 alternative routes  
const url =
  `https://route.mappls.com/route/direction/` +
  `route_adv/trucking/${origin};${dest}` +
  `?geometries=geojson` +
  `alternatives=3`+
  `&steps=true` +
  `&access_token=${MAPPLS_KEY}`;

  try {
    
    const response = await fetch(url);
    
    console.log("STATUS:", response.status);
    
    const data = await response.json();
    
    console.log(data);

    if (!response.ok) {
      const errText = await response.text();
      return { error: "Mappls request failed", detail: errText, status: response.status };
    }

    return data;
  } catch (err) {
    return { error: "Server error calling Mappls", detail: String(err), status: 500 };
  }
}