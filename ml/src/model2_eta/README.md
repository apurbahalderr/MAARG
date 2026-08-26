# Model 2 — Dynamic ETA / Delay Prediction

**Question it answers:** "How much additional travel delay should we expect
beyond the Mappls baseline ETA under current weather, terrain, incident and
disruption conditions?"

- Type: XGBoost regressor
- Prediction unit: road segment x timestamp (segment-level so route delay =
  sum of segment delays)
- Input: exactly 21 features (see `route_eta.py::FEATURE_ORDER`), including
  numeric `disruption_risk` produced by Model 1 — do not recompute or use
  text bands here
- Core equation:
  `adjusted_eta_minutes = mappls_baseline_eta_minutes + predicted_delay_minutes`
- Artifact: `ml/models/eta_xgb_v1.pkl`

## Files

| File | Role |
|---|---|
| `route_eta.py` | Model loading, batch delay prediction, adjusted ETA assembly |

## API surface

Exposed by `src/api/incident_router.py` via `POST /eta/predict`.

Full input/output JSON contracts: `ml/Plan.txt` §25–26.

Model 2 must NOT choose the final route — that is the backend's job.
