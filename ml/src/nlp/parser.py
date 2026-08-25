import re

CAUSE_KEYWORDS = {
    # Most specific causes first — ties in score are broken by this order
    "LANDSLIDE": ["landslide", "mudslide", "rockfall", "debris", "earth fall"],
    "INFRASTRUCTURE_DAMAGE": ["bridge washed away", "bridge", "road crack", "collapsed", "damaged bridge", "infrastructure damage", "washed away"],
    "BLOCKAGE": ["fallen tree", "tree down", "boulder"],
    "FLOOD": ["flood", "flooded", "waterlogging", "river overflow", "submerged", "heavy rain"],
}

SEVERITY_KEYWORDS = {
    "CRITICAL": ["washed away", "blocked", "impassable", "deadly", "totally destroyed", "completely"],
    "HIGH": ["severe", "dangerous", "heavy", "high"],
    "MODERATE": ["slow traffic", "partial damage", "waterlogging", "moderate"],
    "LOW": ["low", "minor", "clear"]
}

def extract_location(text: str):
    loc_match = re.search(r'(near\s+(?:\w+\s+)?km\s*\d+|near\s+\w+|km\s*\d+)', text, re.IGNORECASE)
    return loc_match.group(0) if loc_match else "unspecified location"

def parse_incident_text(text: str):
    """
    Offline parser for unstructured field text.
    Scores all categories and returns the one with the maximum matches to fix precedence bugs.
    """
    text_lower = text.lower()
    
    # Word-boundary matching so "slow" doesn't match "low" and "nuclear" doesn't match "clear"
    def count_keyword_hits(keywords):
        return sum(1 for k in keywords if re.search(r'\b' + re.escape(k) + r'\b', text_lower))

    # Score causes
    cause_scores = {cause: count_keyword_hits(keywords) for cause, keywords in CAUSE_KEYWORDS.items()}
    best_cause = max(cause_scores, key=cause_scores.get)
    if cause_scores[best_cause] == 0:
        best_cause = "UNKNOWN"
            
    # Score severity
    sev_scores = {sev: count_keyword_hits(keywords) for sev, keywords in SEVERITY_KEYWORDS.items()}
                
    best_sev = max(sev_scores, key=sev_scores.get)
    if sev_scores[best_sev] == 0:
        best_sev = "MODERATE"

    return {
        "cause": best_cause,
        "severity": best_sev,
        "location_clue": extract_location(text)
    }
