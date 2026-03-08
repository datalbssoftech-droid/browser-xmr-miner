

## Plan: Complete Homepage Redesign with New Sections & Tools

This is a large feature request covering multiple new homepage sections and standalone tool pages. Here's the implementation plan organized by priority and dependencies.

### What We're Building

**Homepage Sections (in order):**
1. Hero (keep existing)
2. Live Platform Stats bar (keep existing)
3. Start Mining Widget (keep existing)
4. **NEW: How It Works** — 3-step cards (Create Account → Start Mining → Earn Rewards)
5. **NEW: Mining Calculator** — Input hashrate, electricity cost, hours; output daily/monthly XMR + USD value
6. **NEW: Mining Pools** — Display SupportXMR, MoneroOcean, 2Miners with pool fee, min payout info
7. Live XMR Market & News (keep existing)
8. **NEW: Network Stats** — Fetch Monero network hashrate, difficulty, block reward, block time from CoinGecko/public APIs
9. **NEW: Education Section** — Cards linking to articles: What is Monero Mining, How RandomX Works, Browser vs GPU Mining
10. **NEW: Security & Transparency** — Open source engine, secure payouts, verified pool
11. Footer (keep existing, enhanced)

**New Tool Pages (separate routes):**
1. `/tools/calculator` — Mining Profit Calculator (full page version)
2. `/tools/hashrate-converter` — H/s ↔ KH/s ↔ MH/s ↔ GH/s converter
3. `/tools/benchmark` — CPU Benchmark Tool (runs actual mining test, shows hashrate + estimated earnings)
4. `/tools/network` — Monero Network Explorer (latest blocks, difficulty, rewards via public API)
5. `/tools/pools` — Mining Pool Explorer (expanded pool stats)
6. `/tools/price` — XMR Price Tracker with chart

### Technical Approach

**New Components:**
- `src/components/HowItWorks.tsx` — 3-step numbered cards with icons
- `src/components/MiningCalculator.tsx` — Form with sliders/inputs, calculates earnings using current XMR price from existing `useXmrMarketData` hook
- `src/components/MiningPools.tsx` — Static pool data cards (SupportXMR, MoneroOcean, 2Miners) with known fees/minimums
- `src/components/NetworkStats.tsx` — Fetches Monero network data from CoinGecko API (already have the integration)
- `src/components/EducationSection.tsx` — SEO-friendly article cards
- `src/components/SecuritySection.tsx` — Trust badges/cards

**New Tool Pages:**
- `src/pages/tools/CalculatorPage.tsx`
- `src/pages/tools/HashrateConverterPage.tsx`
- `src/pages/tools/BenchmarkPage.tsx` — Uses the existing `useWebSocketMiner` hook to run a timed benchmark
- `src/pages/tools/NetworkExplorerPage.tsx`
- `src/pages/tools/PoolExplorerPage.tsx`
- `src/pages/tools/PriceTrackerPage.tsx`

**Data Sources (all free, no API keys needed):**
- XMR price/market: Already integrated via `xmr-market` edge function + CoinGecko fallback
- Network stats: CoinGecko API (already fetching) — will extend `useXmrMarketData` to include network hashrate, difficulty, block time
- Mining pools: Static data for pool info (fees, minimums are public knowledge)
- Benchmark: Uses existing WebSocket miner hook to measure real hashrate
- Calculator math: `daily_xmr = (hashrate * 86400) / (network_difficulty * 2)` using live difficulty

**Edge Function Update:**
- Extend `xmr-market` to also return network hashrate, difficulty, block reward, and block time from CoinGecko's `/coins/monero` endpoint (data is already available in the response)

**Route Updates in `App.tsx`:**
- Add `/tools/calculator`, `/tools/converter`, `/tools/benchmark`, `/tools/network`, `/tools/pools`, `/tools/price` as public routes

**Homepage Update:**
- Reorder sections in `HomePage.tsx` to follow the requested layout order
- Add a "Tools" section with cards linking to each tool page

### Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/HowItWorks.tsx` | Create |
| `src/components/MiningCalculator.tsx` | Create |
| `src/components/MiningPools.tsx` | Create |
| `src/components/NetworkStats.tsx` | Create |
| `src/components/EducationSection.tsx` | Create |
| `src/components/SecuritySection.tsx` | Create |
| `src/pages/tools/CalculatorPage.tsx` | Create |
| `src/pages/tools/HashrateConverterPage.tsx` | Create |
| `src/pages/tools/BenchmarkPage.tsx` | Create |
| `src/pages/tools/NetworkExplorerPage.tsx` | Create |
| `src/pages/tools/PoolExplorerPage.tsx` | Create |
| `src/pages/tools/PriceTrackerPage.tsx` | Create |
| `src/pages/HomePage.tsx` | Edit — add all new sections |
| `src/App.tsx` | Edit — add tool routes |
| `src/hooks/useXmrMarketData.ts` | Edit — extend with network stats |
| `supabase/functions/xmr-market/index.ts` | Edit — include network data in response |

No database changes needed. All data comes from existing hooks, public APIs, or static content.

