const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const REST_KEY = "syfqaptlzmsvtmygebxyqhyqroeqagpmmfus"; // paste your real key here

console.log("REST_KEY length:", REST_KEY.length);
console.log("REST_KEY starts with:", REST_KEY.substring(0, 4));

app.get("/api/route", async (req, res) => {
    try {
        const { start, end } = req.query; // e.g. ?start=91.7362,26.1445&end=93.5,27.0
     const url = `https://route.mappls.com/route/direction/route_adv/driving/${start};${end}?geometries=geojson&overview=full&alternatives=1&steps=false&access_token=${REST_KEY}`;

      console.log("MAPPLS URL:", url.replace(REST_KEY, "HIDDEN_KEY"));

        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Proxy error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Proxy server running at http://localhost:3000");
});