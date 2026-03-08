import { ExternalLink, Clock, Newspaper } from "lucide-react";
import type { XmrNewsItem } from "@/hooks/useXmrMarketData";

interface XmrNewsFeedProps {
  news: XmrNewsItem[] | undefined;
  isLoading: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const XmrNewsFeed = ({ news, isLoading }: XmrNewsFeedProps) => {
  if (isLoading) {
    return (
      <div className="stat-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h3 className="font-bold">XMR News</h3>
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-5 w-5 text-primary" />
          <h3 className="font-bold">XMR News</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">No news available right now</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-5 w-5 text-primary" />
        <h3 className="font-bold">Latest XMR News</h3>
      </div>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h4>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="font-mono text-primary/80">{item.source}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(item.publishedAt)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
