const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const readError = async (res: Response) => {
  try {
    const body = await res.json();
    return typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

export async function fetchMarketData<T>(params: Record<string, string>): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/market-data?${new URLSearchParams(params)}`, { headers });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()).data as T;
}

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()).data as T;
}

export interface ForexSeries { base: string; start_date: string; end_date: string; rates: Record<string, Record<string, number>> }
export interface ForexLatest { base: string; date: string; rates: Record<string, number> }
export interface StockQuote { symbol: string; name: string; currency: string; price: number | null; changePercent: number | null; marketTime: string | null; series: { date: string; close: number | null }[] }
export interface CoinQuote { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number | null; market_cap: number; total_volume: number; last_updated: string }
export interface GdpCountry { country: string; name: string; observations: { year: string; growth: number | null }[] }
export interface GdpData { source: string; countries: GdpCountry[] }
export interface EconEvent { title: string; country: string; date: string; impact: string; forecast: string; previous: string }
export interface EventsData { source: string; fetchedAt: string; events: EconEvent[] }
