import { useQuery } from "@tanstack/react-query";

interface XmrMarketData {
  price: number;
  priceChange24h: number;
  difficulty: number;
  hashrate: number;
}

const fetchXmrData = async (): Promise<XmrMarketData> => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/monero?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false",
    );
    if (!res.ok) throw new Error("CoinGecko API error");
    const json = await res.json();
    return {
      price: json.market_data?.current_price?.usd ?? 0,
      priceChange24h: json.market_data?.price_change_percentage_24h ?? 0,
      difficulty: json.market_data?.total_supply ?? 0, // approximate
      hashrate: 0,
    };
  } catch {
    return { price: 0, priceChange24h: 0, difficulty: 0, hashrate: 0 };
  }
};

export const useXmrMarketData = () =>
  useQuery({
    queryKey: ["xmr-market"],
    queryFn: fetchXmrData,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
