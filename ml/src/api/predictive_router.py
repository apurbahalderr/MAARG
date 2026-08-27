from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from src.model1_disruption_risk.route_risk import predict_route_risk
from src.model2_eta.route_eta import predict_route_eta

router = APIRouter(prefix="/predict", tags=["predictive-models"])

class RouteRequest(BaseModel):
    routes: List[Dict[str, Any]]

class ETARequest(BaseModel):
    timestamp: str
    routes: List[Dict[str, Any]]

@router.post("/risk")
async def risk_predict(request: RouteRequest):
    try:
        results = []
        for route_data in request.routes:
            res = predict_route_risk(route_data)
            results.append(res)
        return {"routes": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/eta")
async def eta_predict(request: ETARequest):
    try:
        results = []
        for route_data in request.routes:
            res = predict_route_eta(route_data, request.timestamp)
            results.append(res)
        return {"routes": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
