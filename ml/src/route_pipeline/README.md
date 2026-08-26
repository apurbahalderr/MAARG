# src/route_pipeline — Route Processing Pipeline

Shared route-processing code used by **both** Model 1 and Model 2 (and by the
API layer). This is the step-by-step chain that turns a Mappls response into
model-ready segment features. Kept in one place so the two model packages
never drift apart.

| File | Role |
|---|---|
| `mappls_adapter.py` | Mappls Predictive Routing request builder, mock/live fetch, response normalization into MAARG's internal route contract. Raw Mappls JSON never leaks past this file. |
| `geometry.py` | Encoded-polyline encode/decode, haversine distance, ~1 km analytical route segmentation. |
| `synthetic_features.py` | Deterministic (md5-seeded) per-segment features for both models. Prototype-only; real data sources replace this in later rounds (see `ml/Plan.txt` §33). |

## Ownership

ML team (Model 1 + Model 2 owner). Teammates working on `cv/`, `nlp/`, `news/`
should not need to modify anything here.
