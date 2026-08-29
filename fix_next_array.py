import re

with open("app/app/api/routes/route.ts", "r", encoding="utf-8") as f:
    code = f.read()

pattern = r"const indexed = rawRoutes\.map\(\(r, i\) => \(\{\s*r,\s*scored: scored\[i\].*?\s*i,\s*\}\)\);\s*indexed\.sort\(\(a, b\) => a\.scored\.disruption_risk - b\.scored\.disruption_risk\);\s*const routes = indexed\.map\(\(\{ r, scored: s \}, rankIdx\) => \{"

replacement = r"""  // Iterate over scored since ML might have added detour routes!
  const indexed = scored.map((s, i) => {
    // Find the original rawRoute that this route is based on
    const originalRouteIdMatch = s.route_id.match(/route_(\d+)/);
    const originalIndex = originalRouteIdMatch ? parseInt(originalRouteIdMatch[1]) - 1 : 0;
    const r = rawRoutes[originalIndex] || rawRoutes[0];
    return { r, scored: s, i };
  });
    
  indexed.sort((a, b) => a.scored.disruption_risk - b.scored.disruption_risk);

  const routes = indexed.map(({ r, scored: s }, rankIdx) => {"""

code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open("app/app/api/routes/route.ts", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated Next.js to map over scored routes.")
