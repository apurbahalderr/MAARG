with open("app/app/api/routes/route.ts", "r", encoding="utf-8") as f:
    code = f.read()

old_logic = """  const indexed = rawRoutes.map((r, i) => ({
      r,
      scored: scored[i] ?? { route_id: `route_${i + 1}`, disruption_risk: 50, risk_band: "MODERATE" },
      i,
    }));
    indexed.sort((a, b) => a.scored.disruption_risk - b.scored.disruption_risk);
  
    const routes = indexed.map(({ r, scored: s }, rankIdx) => {"""

new_logic = """  // Iterate over scored since ML might have added detour routes!
    const indexed = scored.map((s, i) => {
      // Find the original rawRoute that this route is based on
      const originalRouteIdMatch = s.route_id.match(/route_(\\d+)/);
      const originalIndex = originalRouteIdMatch ? parseInt(originalRouteIdMatch[1]) - 1 : 0;
      const r = rawRoutes[originalIndex] || rawRoutes[0];
      return { r, scored: s, i };
    });
    
    indexed.sort((a, b) => a.scored.disruption_risk - b.scored.disruption_risk);
  
    const routes = indexed.map(({ r, scored: s }, rankIdx) => {"""

# Replace exact string
code = code.replace(old_logic, new_logic)

with open("app/app/api/routes/route.ts", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated Next.js to map over scored routes.")
