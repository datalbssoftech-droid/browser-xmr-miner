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

interface XmrNetworkResponse {
  hashrate: number;
  difficulty: number;
  blockReward: number;
  blockTime: number;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
}

// Fetch with hard timeout — prevents the function from hanging on slow upstreams
async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMarket(): Promise<XmrMarketResponse | null> {
  try {
    const res = await fetchWithTimeout(
      "https://api.coingecko.com/api/v3/coins/monero?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true",
      8000,
    );
    if (!res.ok) return null;
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
  } catch (e) {
    console.error("market fetch failed:", e);
    return null;
  }
}

async function fetchNetwork(): Promise<XmrNetworkResponse> {
  const blockTime = 120;
  let networkHashrate = 0;
  let networkDifficulty = 0;
  let blockReward = 0.6;

  try {
    const netRes = await fetchWithTimeout("https://moneroblocks.info/api/get_stats", 5000);
    if (netRes.ok) {
      const netJson = await netRes.json();
      networkHashrate = netJson.hashrate || 0;
      networkDifficulty = netJson.difficulty || 0;
      blockReward = netJson.last_reward ? netJson.last_reward / 1e12 : 0.6;
    }
  } catch (e) {
    console.error("network fetch failed:", e);
  }

  if (!networkDifficulty) networkDifficulty = 300_000_000_000;
  if (!networkHashrate) networkHashrate = networkDifficulty / blockTime;

  return { hashrate: networkHashrate, difficulty: networkDifficulty, blockReward, blockTime };
}

async function fetchXmrNews(): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(
      "https://news.google.com/rss/search?q=Monero+XMR+cryptocurrency&hl=en-US&gl=US&ceid=US:en",
      5000,
      { headers: { "User-Agent": "Harimine/1.0" } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    return parseGoogleNewsRss(xml).slice(0, 10);
  } catch (e) {
    console.error("news fetch failed:", e);
    return [];
  }
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

    const wantMarket = type === "market" || type === "all";
    const wantNews = type === "news" || type === "all";

    // Run all upstream calls in parallel — total wait bounded by slowest (~8s)
    const [market, network, news] = await Promise.all([
      wantMarket ? fetchMarket() : Promise.resolve(null),
      wantMarket ? fetchNetwork() : Promise.resolve(null),
      wantNews ? fetchXmrNews() : Promise.resolve([]),
    ]);

    return new Response(JSON.stringify({ success: true, market, network, news }), {
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
