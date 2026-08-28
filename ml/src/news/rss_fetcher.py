import feedparser
import urllib.parse
import requests

def fetch_ner_disaster_news(region: str = None):
    """
    Fetches real-time news related to disasters in North-East Region (NER) via Google News RSS.
    """
    if region and region != "All NER":
        query = f"(landslide OR flood OR rainfall OR block OR disaster) AND ({region})"
    else:
        # Grouped query to prevent matching generic news from NER states
        query = "(landslide OR flood OR rainfall OR block) AND (Assam OR Meghalaya OR Sikkim OR NER OR Arunachal)"
        
    encoded_query = urllib.parse.quote(query)
    rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    
    try:
        # Use requests with a timeout to prevent feedparser from hanging indefinitely
        resp = requests.get(rss_url, timeout=10)
        feed = feedparser.parse(resp.content)
    except Exception as e:
        print(f"Failed to fetch RSS: {e}")
        return []

    import re
    articles = []
    
    for entry in feed.entries[:10]:
        tag = "GENERAL"
        title_lower = entry.title.lower()
        if "landslide" in title_lower: tag = "LANDSLIDE"
        elif "flood" in title_lower: tag = "FLOOD"
        elif "rain" in title_lower: tag = "WEATHER"

        # Attempt to extract live image from RSS description HTML
        img_url = None
        if hasattr(entry, 'description'):
            match = re.search(r'<img[^>]+src=["\'](.*?)["\']', entry.description, re.IGNORECASE)
            if match:
                img_url = match.group(1)

        articles.append({
            "title": entry.title,
            "link": entry.link,
            "published": entry.published,
            "source": entry.source.title if hasattr(entry, 'source') else "Google News",
            "tag": tag,
            "image": img_url
        })
    from dateutil import parser
    articles.sort(key=lambda x: parser.parse(x["published"]), reverse=True)
    return articles
