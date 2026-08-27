# Live Data Bridge Module

## Purpose
This module acts as the messenger between your AI verification engines (CV/NLP) and the main Backend Orchestrator (Anshu's domain).

## How it Works
1. Once an incident is officially `VERIFIED` by the CV/NLP module, this script is triggered.
2. It constructs a payload containing the exact latitude, longitude, and severity of the disaster.
3. It sends this payload to the backend API (`/api/missions/recalculate`).
4. The backend then uses this location to block the road segment, update Teammates' ML models (Model 1 & 2), and request a new route from Mappls.

## Files
* `live_bridge.py`: Script simulating the HTTP POST request to the backend rerouting engine.
