"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface NewsArticle {
  title: string;
  link: string;
  published: string;
  source: string;
  tag: string;
  image?: string;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState("All NER");

  const REGIONS = [
    "All NER", "Assam", "Arunachal Pradesh", "Meghalaya", 
    "Sikkim", "Manipur", "Mizoram", "Nagaland", "Tripura"
  ];

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      try {
        const url = region === "All NER" 
          ? "http://127.0.0.1:8001/api/v1/news/ner" 
          : `http://127.0.0.1:8001/api/v1/news/ner?region=${encodeURIComponent(region)}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch news");
        const data = await res.json();
        setNews(data.articles || []);
      } catch (err) {
        setError(`Unable to load live disaster news for ${region}.`);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [region]);

  return (
    <div className="rounded-[10px] border border-line bg-surface p-7 mt-6">
      <div className="mb-6 border-b border-line pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon name="alertTriangle" size={20} className="text-warning" />
          <h2 className="text-xl font-bold tracking-tight text-navy">Live Disaster Intel</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="region-select" className="text-[13px] font-semibold text-muted">Filter Region:</label>
          <select 
            id="region-select"
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-[13px] text-ink focus:border-india focus:outline-none focus:ring-1 focus:ring-india"
          >
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading live news feed for {region}...</p>
      ) : error ? (
        <p className="text-[13px] text-danger">{error}</p>
      ) : news.length === 0 ? (
        <p className="text-[13px] text-muted">No recent critical news found in the NER region.</p>
      ) : (
        <ul className="space-y-6">
          {news.slice(0, 5).map((article, idx) => {
            // Clean up the trailing " - Source" from the title
            const cleanTitle = article.title.replace(new RegExp(` - ${article.source}$`, 'i'), '').replace(new RegExp(` \\| ${article.source}$`, 'i'), '').trim();
            
            return (
              <li key={idx} className="flex flex-col justify-center border-b border-line pb-5 last:border-0 last:pb-0">
                  <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-[15px] sm:text-[16px] leading-snug font-semibold text-primary hover:underline line-clamp-2">
                    {cleanTitle}
                  </a>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      article.tag === "CRITICAL" ? "bg-danger/10 text-danger" : "bg-india/10 text-india"
                    }`}>
                      {article.tag}
                    </span>
                    <span className="font-medium text-navy">{article.source}</span>
                    <span>{new Date(article.published).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
