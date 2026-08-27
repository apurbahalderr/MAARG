let map;

window.onload = function () {
    map = new mappls.Map("map", {
        center: { lat: 26.144293, lng: 91.736155 },
        zoom: 8
    });

    map.on("load", loadRoutes);
};

async function loadRoutes() {
    const start = "91.7362,26.1445";
    const end = "93.5,27.0";
    const url = `http://localhost:3000/api/route?start=${start}&end=${end}`;

    let routes;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.msg || data.error);
        console.log("Mappls response:", data);
        routes = parseRoutes(data);
    } catch (err) {
        console.warn("Routing API failed, using mock data:", err.message);
        routes = getMockRoutes();
    }
    drawRoutes(routes);
    renderCards(routes);
}

function getMockRoutes() {
    return [
        { id: "route_1", coordinates: [[91.7362,26.1445],[92.4,26.3],[93.1,26.5],[93.8,26.7]], distanceKm: 410, eta: "8h 40m", riskScore: 18, risk: "LOW", color: "#22c55e" },
        { id: "route_2", coordinates: [[91.7362,26.1445],[92.5,26.2],[93.2,26.4],[93.8,26.7]], distanceKm: 380, eta: "7h 55m", riskScore: 46, risk: "MEDIUM", color: "#f59e0b" },
        { id: "route_3", coordinates: [[91.7362,26.1445],[92.6,26.1],[93.3,26.3],[93.8,26.7]], distanceKm: 350, eta: "7h 20m", riskScore: 82, risk: "HIGH", color: "#ef4444" }
    ];
}

// Placeholder risk order — first route = safest, last = riskiest.
// Swap this out once your real risk engine assigns scores per route.
function parseRoutes(data) {
    const placeholderScores = [18, 46, 82];
    const rawRoutes = data.routes || [];

    return rawRoutes.map((r, i) => {
        const score = placeholderScores[i] ?? 50;
        const riskInfo = classifyRisk(score);
        return {
            id: `route_${i + 1}`,
            coordinates: r.geometry.coordinates,   // [ [lng, lat], ... ]
            distanceKm: Math.round(r.distance / 1000),
            eta: formatDuration(r.duration),
            riskScore: score,
            risk: riskInfo.level,
            color: riskInfo.color
        };
    });
}

function classifyRisk(score) {
    if (score <= 30) return { level: "LOW", color: "#22c55e" };
    if (score <= 60) return { level: "MEDIUM", color: "#f59e0b" };
    return { level: "HIGH", color: "#ef4444" };
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

function drawRoutes(routes) {
    const allPoints = [];

    routes.forEach(route => {
        const path = route.coordinates.map(([lng, lat]) => ({ lat, lng }));
        allPoints.push(...path);

        new mappls.Polyline({
            map: map,
            path: path,
            strokeColor: route.color,
            strokeWeight: route.risk === "LOW" ? 6 : 4,
            strokeOpacity: 0.9
        });
    });

    if (allPoints.length && map.fitBounds) {
        map.fitBounds(allPoints);
    }
}

function renderCards(routes) {
    const container = document.getElementById("route-cards");
    container.innerHTML = "";

    routes.forEach(route => {
        const card = document.createElement("div");
        card.className = `route-card ${route.risk.toLowerCase()}`;
        card.innerHTML = `
            <div class="r-title">${route.risk} RISK</div>
            <div class="r-row"><span>ETA</span><b>${route.eta}</b></div>
            <div class="r-row"><span>Distance</span><b>${route.distanceKm} km</b></div>
            <div class="r-row"><span>Risk score</span><b>${route.riskScore}/100</b></div>
        `;
        container.appendChild(card);
    });
}