import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface XmrMarketResponse {
  price: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
  sparkline7d: number[];
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
}

async function fetchXmrMarket(): Promise<XmrMarketResponse> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/monero?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true",
  );
  if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);
  const json = await res.json();
  const md = json.market_data;
  return {
    price: md?.current_price?.usd ?? 0,
    priceChange24h: md?.price_change_percentage_24h ?? 0,
    priceChange7d: md?.price_change_percentage_7d ?? 0,
    marketCap: md?.market_cap?.usd ?? 0,
    volume24h: md?.total_volume?.usd ?? 0,
    high24h: md?.high_24h?.usd ?? 0,
    low24h: md?.low_24h?.usd ?? 0,
    circulatingSupply: md?.circulating_supply ?? 0,
    sparkline7d: md?.sparkline_7d?.price?.slice(-24) ?? [],
  };
}

async function fetchXmrNews(): Promise<NewsItem[]> {
  // Use CoinGecko search trending + Google News RSS as free sources
  const feeds = [
    {
      url: "https://news.google.com/rss/search?q=Monero+XMR+cryptocurrency&hl=en-US&gl=US&ceid=US:en",
      parser: parseGoogleNewsRss,
    },
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Harimine/1.0" },
      });
      if (res.ok) {
        const xml = await res.text();
        const items = feed.parser(xml);
        if (items.length > 0) return items.slice(0, 10);
      }
    } catch (e) {
      console.error("Feed fetch error:", e);
    }
  }

  return [];
}

function parseGoogleNewsRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const source = extractTag(block, "source");
    const description = extractTag(block, "description");

    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        url: link,
        source: source || "Google News",
        publishedAt: pubDate || new Date().toISOString(),
        description: stripHtml(decodeHtmlEntities(description || "")).slice(0, 200),
      });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`).exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const simpleMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(xml);
  return simpleMatch ? simpleMatch[1].trim() : "";
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "all";

    let market: XmrMarketResponse | null = null;
    let news: NewsItem[] = [];

    if (type === "market" || type === "all") {
      market = await fetchXmrMarket();
    }
    if (type === "news" || type === "all") {
      news = await fetchXmrNews();
    }

    return new Response(JSON.stringify({ success: true, market, news }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("XMR market error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
