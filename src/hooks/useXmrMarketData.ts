import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface XmrMarketData {
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

export interface XmrNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
}

interface ApiResponse {
  success: boolean;
  market: XmrMarketData | null;
  news: XmrNewsItem[];
  error?: string;
}

const fetchXmrMarketAndNews = async (): Promise<ApiResponse> => {
  const { data, error } = await supabase.functions.invoke("xmr-market", {
    method: "GET",
  });

  if (error) {
    console.error("Edge function error:", error);
    // Fallback to direct CoinGecko call for price only
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/monero?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true",
      );
      if (res.ok) {
        const json = await res.json();
        const md = json.market_data;
        return {
          success: true,
          market: {
            price: md?.current_price?.usd ?? 0,
            priceChange24h: md?.price_change_percentage_24h ?? 0,
            priceChange7d: md?.price_change_percentage_7d ?? 0,
            marketCap: md?.market_cap?.usd ?? 0,
            volume24h: md?.total_volume?.usd ?? 0,
            high24h: md?.high_24h?.usd ?? 0,
            low24h: md?.low_24h?.usd ?? 0,
            circulatingSupply: md?.circulating_supply ?? 0,
            sparkline7d: md?.sparkline_7d?.price?.slice(-24) ?? [],
          },
          news: [],
        };
      }
    } catch {}
    return { success: false, market: null, news: [] };
  }

  return data as ApiResponse;
};

export const useXmrMarketData = () =>
  useQuery({
    queryKey: ["xmr-market-full"],
    queryFn: fetchXmrMarketAndNews,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
