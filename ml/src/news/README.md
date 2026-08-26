# Live News (RSS) Module

## Purpose
Fetches real-time disaster and weather-related news specifically for the North-East Region (NER) to display on the dispatcher dashboard.

## How it Works
1. Queries Google News RSS with specific keywords (`landslide OR flood OR rainfall Assam OR Meghalaya OR NER`).
2. Parses the XML feed using `feedparser`.
3. Cleans and tags the output so the frontend can easily render a "Live Updates" sidebar.

## Files
* `rss_fetcher.py`: The main feed parser and article tagger.
