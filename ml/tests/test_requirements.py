from fastapi.testclient import TestClient
from src.api.incident_router import app
from src.model1_disruption_risk.route_risk import FEATURE_ORDER
import src.model1_disruption_risk.route_risk
import numpy as np
from unittest.mock import patch

client = TestClient(app)

def make_route(route_id, num_segments):
    features = {f: 0.0 for f in FEATURE_ORDER}
    segments = []
    for i in range(num_segments):
        segments.append({
            "segment_id": f"{route_id}_s{i}",
            "features": features.copy()
        })
    return {
        "route_id": route_id,
        "segments": segments
    }

class MockModel:
    def __init__(self, expected_scores):
        self.expected_scores = expected_scores
        self.call_count = 0
        
    def predict_proba(self, X):
        scores = self.expected_scores[self.call_count]
        self.call_count += 1
        probs = np.zeros((len(scores), 2))
        probs[:, 1] = scores
        return probs
        
def test_a():
    route = make_route("rA", 3)
    mock = MockModel([[0.90, 0.80, 0.75]])
    with patch('src.model1_disruption_risk.route_risk.load_model', return_value=mock):
        response = client.post("/risk/predict", json={"timestamp": "2024", "routes": [route]})
        print("TEST A:", response.json())

def test_b():
    route = make_route("rB", 5)
    mock = MockModel([[0.10, 0.12, 0.15, 0.95, 0.10]])
    with patch('src.model1_disruption_risk.route_risk.load_model', return_value=mock):
        response = client.post("/risk/predict", json={"timestamp": "2024", "routes": [route]})
        print("TEST B:", response.json())

def test_c():
    route = make_route("rC", 4)
    mock = MockModel([[0.05, 0.08, 0.11, 0.13]])
    with patch('src.model1_disruption_risk.route_risk.load_model', return_value=mock):
        response = client.post("/risk/predict", json={"timestamp": "2024", "routes": [route]})
        print("TEST C:", response.json())

def test_d():
    route1 = make_route("rD1", 2)
    route2 = make_route("rD2", 2)
    route3 = make_route("rD3", 2)
    mock = MockModel([[0.1, 0.1], [0.5, 0.5], [0.9, 0.9]])
    with patch('src.model1_disruption_risk.route_risk.load_model', return_value=mock):
        response = client.post("/risk/predict", json={"timestamp": "2024", "routes": [route1, route2, route3]})
        print("TEST D:", response.json())

if __name__ == '__main__':
    test_a()
    test_b()
    test_c()
    test_d()
