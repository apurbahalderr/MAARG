# Model 1 — Disruption Risk Prediction

**Question it answers:** "How likely is this road segment to experience a
disruption in the next 6 hours under current conditions?"

- Type: tabular XGBoost classifier
- Prediction unit: road segment x timestamp
- Input: exactly 18 features (see `route_risk.py::FEATURE_ORDER`)
- Output: `disruption_score` in [0, 1] with operational bands
  LOW / MODERATE / HIGH / CRITICAL
- Artifact: `ml/models/disruption_xgb.pkl`

## Route aggregation

Route risk is NOT a simple mean:

```
route_risk = 0.50 * mean_segment_risk
           + 0.30 * p90_segment_risk
           + 0.20 * max_segment_risk
```

Segments scoring >= 0.50 are listed as high-risk, >= 0.75 as critical.

## Files

| File | Role |
|---|---|
| `route_risk.py` | Model loading, batch segment inference, route-risk aggregation |

## API surface

Exposed by `src/api/incident_router.py` via `POST /risk/predict`.

Full contract details: `ml/Plan.txt` §4–6.
