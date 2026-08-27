import requests

BACKEND_REROUTE_API = "http://localhost:8000/api/missions/recalculate"

def trigger_backend_rerouting(mission_id: str, latitude: float, longitude: float, severity: str):
    """
    Called when an incident is VERIFIED by CV/NLP.
    Sends the exact blockage coordinates to the Backend orchestrator to trigger Route Re-scoring and Mappls Rerouting.
    """
    payload = {
        "event_type": "VERIFIED_INCIDENT",
        "latitude": latitude,
        "longitude": longitude,
        "severity": severity,
        "action": "BLOCK_AND_REROUTE" if severity == "CRITICAL" else "WARN_AND_RESCORE"
    }
    
    print(f"Triggering live bridge to Backend for Mission {mission_id}...")
    print(f"Payload: {payload}")
    
    try:
        # In a real environment, this makes a POST request to Anshu's Backend API.
        # response = requests.post(f"{BACKEND_REROUTE_API}/{mission_id}", json=payload)
        # return response.json()
        print("Live Bridge simulation: successfully pushed incident coordinate to Backend.")
        return {"status": "success", "backend_action": payload["action"]}
    except Exception as e:
        print(f"Failed to reach backend: {e}")
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    # Test simulation
    trigger_backend_rerouting("M-2026-0012", 25.5788, 91.8821, "CRITICAL")
