from __future__ import annotations
from pathlib import Path
import numpy as np
import pandas as pd

SEED = 42
N_ROWS = 12000
OUT_DIR = Path(__file__).resolve().parent
rng = np.random.default_rng(SEED)

# Demo candidate routes: three alternatives between the same origin/destination.
routes = [
    ("R_A", "Guwahati-Shillong-A"),
    ("R_B", "Guwahati-Shillong-B"),
    ("R_C", "Guwahati-Shillong-C"),
]

rows = []
for route_id, route_name in routes:
    for seg in range(1, 26):
        rows.append({
            "route_id": route_id,
            "route_name": route_name,
            "segment_no": seg,
            "segment_id": f"{route_id}_S{seg:02d}",
            "distance_km": rng.uniform(1.0, 5.0),
            "base_speed_kmph": rng.uniform(30, 60),
            "road_class": rng.choice(["primary", "secondary", "hill"]),
        })
route_df = pd.DataFrame(rows)

# Sample segment x timestamp observations.
timestamps = pd.date_range("2024-01-01", "2025-12-31 21:00:00", freq="3h")
df = route_df.sample(n=N_ROWS, replace=True, random_state=SEED).reset_index(drop=True)
df["timestamp"] = rng.choice(timestamps, size=N_ROWS)
df["month"] = df["timestamp"].dt.month

# Terrain.
df["slope_mean"] = np.clip(rng.gamma(4.0, 4.5, N_ROWS), 3, 45)
df["slope_max"] = np.clip(df["slope_mean"] + rng.gamma(2.0, 2.5, N_ROWS), df["slope_mean"], 60)
df["elevation_change"] = np.clip(
    df["slope_mean"] * df["distance_km"] * 12 + rng.normal(0, 20, N_ROWS),
    5, 900
)

# Historical hazard proxies.
df["historical_landslide_count_1km"] = rng.poisson(np.clip(df["slope_mean"] / 12, 0.05, 5))
df["historical_landslide_count_5km"] = (
    df["historical_landslide_count_1km"] + rng.poisson(2.0, N_ROWS)
)
df["days_since_nearest_landslide"] = rng.integers(10, 2500, N_ROWS)
df["historical_route_landslide_density"] = np.clip(
    df["historical_landslide_count_5km"] / 10
    + df["slope_mean"] / 100
    + rng.normal(0, 0.03, N_ROWS), 0, 2
)

# Seasonal rainfall regime.
season = df["month"].map({1:.25,2:.25,3:.35,4:.55,5:.75,6:1.20,7:1.50,8:1.45,9:1.15,10:.75,11:.40,12:.25}).to_numpy()
storm = rng.gamma(1.7, 8.0, N_ROWS)
df["rain_1h"] = np.clip(storm * season + rng.normal(0, 2.0, N_ROWS), 0, 120)
df["rain_6h"] = np.clip(df["rain_1h"] * rng.uniform(1.2, 3.5, N_ROWS) + rng.gamma(1.2, 8.0, N_ROWS), 0, 300)
df["rain_24h"] = np.clip(df["rain_6h"] * rng.uniform(1.4, 3.8, N_ROWS) + rng.gamma(1.5, 15.0, N_ROWS), 0, 650)
df["rain_72h"] = np.clip(df["rain_24h"] * rng.uniform(1.5, 3.0, N_ROWS) + rng.gamma(1.5, 20.0, N_ROWS), 0, 1200)
df["rain_change_3h"] = np.clip(rng.normal(df["rain_1h"] * 0.15, 4.0, N_ROWS), -20, 40)

# Soil moisture proxies correlated with rainfall.
df["soil_moisture_surface"] = np.clip(
    0.20 + 0.00035 * df["rain_24h"] + 0.025 * season + rng.normal(0, 0.045, N_ROWS),
    0.08, 0.65
)
df["soil_moisture_rootzone"] = np.clip(
    df["soil_moisture_surface"] * 0.92 + rng.normal(0, 0.025, N_ROWS),
    0.08, 0.62
)
df["soil_moisture_delta_24h"] = np.clip(
    0.0008 * df["rain_24h"] + rng.normal(0, 0.025, N_ROWS) - 0.02,
    -0.15, 0.25
)

# Active incident proxies.
p_inc = np.clip(
    0.02 + df["historical_landslide_count_1km"] * 0.03 + df["rain_1h"] / 1800,
    0, 0.45
)
df["active_incident_count_1km"] = rng.binomial(2, p_inc)
sev = np.zeros(N_ROWS)
mask = df["active_incident_count_1km"] > 0
sev[mask] = rng.choice([0.25, 0.5, 0.75, 1.0], size=mask.sum(), p=[.20, .35, .30, .15])
df["active_incident_severity_score"] = sev

# Stochastic latent disruption mechanism: ML must learn the relationship.
def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -20, 20)))

z = (
    -5.0
    + 0.020 * df["rain_1h"]
    + 0.006 * df["rain_6h"]
    + 0.0028 * df["rain_24h"]
    + 0.0010 * df["rain_72h"]
    + 0.018 * df["slope_mean"]
    + 0.012 * df["slope_max"]
    + 2.4 * df["soil_moisture_delta_24h"]
    + 2.1 * df["soil_moisture_surface"]
    + 0.18 * df["historical_landslide_count_1km"]
    + 0.07 * df["historical_landslide_count_5km"]
    + 0.55 * df["historical_route_landslide_density"]
    + 0.90 * df["active_incident_count_1km"]
    + 1.8 * df["active_incident_severity_score"]
    + 0.0004 * np.maximum(df["rain_24h"] * df["slope_mean"], 0)
    + rng.normal(0, 1.0, N_ROWS)
)
p = sigmoid(z)
df["synthetic_disruption_probability"] = p  # diagnostic only; never present as real probability.
df["disruption_next_6h"] = rng.binomial(1, p)

# Save outputs.
df.to_csv(OUT_DIR / "disruption_training.csv", index=False)
route_df.to_csv(OUT_DIR / "route_segments.csv", index=False)

schema = [
    ("segment_id", "ID", "Road segment identifier"),
    ("route_id", "ID", "Candidate route identifier"),
    ("timestamp", "datetime", "Prediction timestamp"),
    ("distance_km", "float", "Segment length"),
    ("base_speed_kmph", "float", "Baseline speed"),
    ("slope_mean", "float", "Mean segment slope"),
    ("slope_max", "float", "Maximum/local slope"),
    ("elevation_change", "float", "Elevation change proxy"),
    ("historical_landslide_count_1km", "int", "Historical hazard density proxy"),
    ("historical_landslide_count_5km", "int", "Broader historical hazard density proxy"),
    ("days_since_nearest_landslide", "int", "Historical recency proxy"),
    ("historical_route_landslide_density", "float", "Historical route susceptibility proxy"),
    ("rain_1h", "float", "Rainfall preceding 1 hour"),
    ("rain_6h", "float", "Rainfall preceding 6 hours"),
    ("rain_24h", "float", "Rainfall preceding 24 hours"),
    ("rain_72h", "float", "Rainfall preceding 72 hours"),
    ("rain_change_3h", "float", "Recent rainfall change"),
    ("soil_moisture_surface", "float", "Surface soil moisture proxy"),
    ("soil_moisture_rootzone", "float", "Root-zone soil moisture proxy"),
    ("soil_moisture_delta_24h", "float", "24-hour soil moisture change"),
    ("active_incident_count_1km", "int", "Nearby active incidents"),
    ("active_incident_severity_score", "float", "Severity-weighted incidents"),
    ("month", "int", "Month"),
    ("disruption_next_6h", "int", "TARGET: disruption in next six hours"),
]
pd.DataFrame(schema, columns=["feature", "type", "description"]).to_csv(OUT_DIR / "data_dictionary.csv", index=False)

print("Created:")
print("  disruption_training.csv")
print("  route_segments.csv")
print("  data_dictionary.csv")
print("Rows:", len(df))
print("Positive rate:", round(df["disruption_next_6h"].mean(), 4))