import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; FiniveraDashboard/1.0)' };

const jsonResponse = (body: unknown, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

const fetchJson = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { ...init, headers: { ...UA, ...(init?.headers ?? {}) }, signal: AbortSignal.timeout(20_000) });
  const text = await res.text();
  if (!res.ok) throw new Error(`upstream ${res.status}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('upstream returned invalid JSON');
  }
};

const DatasetSchema = z.object({
  dataset: z.enum(['forex-latest', 'forex-series', 'stocks', 'crypto', 'gdp', 'events']),
  base: z.string().trim().toUpperCase().length(3).optional(),
  symbols: z.string().trim().max(60).optional(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tickerSymbols: z.string().trim().max(120).optional(),
  range: z.enum(['5d', '1mo', '3mo', '6mo', '1y', '2y']).optional(),
  interval: z.enum(['1d', '1wk']).optional(),
  coinIds: z.string().trim().max(120).optional(),
  countries: z.string().trim().max(30).optional(),
});

const parseParams = (url: URL, body: unknown) => {
  const raw: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) raw[key] = value;
  if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (value !== undefined && value !== null && typeof value !== 'object') raw[key] = String(value);
    }
  }
  return DatasetSchema.safeParse(raw);
};

const frankfurterPath = (dataset: 'forex-latest' | 'forex-series', params: z.infer<typeof DatasetSchema>) => {
  const base = params.base ?? 'USD';
  const symbols = (params.symbols ?? 'INR').split(',').map((s) => s.trim().toUpperCase()).filter((s) => s.length === 3).slice(0, 6).join(',');
  if (dataset === 'forex-latest') return `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols}`;
  const start = params.start ?? '2026-01-01';
  const end = params.end ?? new Date().toISOString().slice(0, 10);
  if (start > end) throw new Error('start date must be before end date');
  return `https://api.frankfurter.dev/v1/${start}..${end}?base=${base}&symbols=${symbols}`;
};

const yahooStocks = async (params: z.infer<typeof DatasetSchema>) => {
  const symbols = (params.tickerSymbols ?? '^NSEI,^BSESN,^NSEBANK,^CNXIT')
    .split(',').map((s) => s.trim()).filter(Boolean).slice(0, 6);
  const range = params.range ?? '1mo';
  const interval = params.interval ?? '1d';
  const results = await Promise.all(symbols.map(async (symbol) => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    const data = await fetchJson(url) as {
      chart: { result: { meta: Record<string, unknown>; timestamp?: number[]; indicators: { quote: { close: (number | null)[] }[] } }[]; error: unknown };
    };
    const chart = data.chart?.result?.[0];
    if (!chart) throw new Error(`no data for ${symbol}`);
    const meta = chart.meta as { symbol?: string; currency?: string; exchangeName?: string; regularMarketPrice?: number; regularMarketTime?: number; previousClose?: number; chartPreviousClose?: number; regularMarketChangePercent?: number; longName?: string; shortName?: string };
    const closes = (chart.indicators?.quote?.[0]?.close ?? []).map((c) => (typeof c === 'number' ? Number(c.toFixed(2)) : null));
    const timestamps = chart.timestamp ?? [];
    return {
      symbol: meta.symbol ?? symbol,
      name: meta.longName ?? meta.shortName ?? symbol,
      currency: meta.currency ?? '',
      exchange: meta.exchangeName ?? '',
      price: meta.regularMarketPrice ?? null,
      changePercent: meta.regularMarketChangePercent ?? null,
      previousClose: meta.previousClose ?? null,
      marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
      series: timestamps.map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), close: closes[i] ?? null })),
    };
  }));
  return results;
};

const coingeckoCoins = async (params: z.infer<typeof DatasetSchema>) => {
  const ids = params.coinIds ?? 'bitcoin,ethereum,solana,cardano';
  return fetchJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&per_page=10&price_change_percentage=24h`) as Promise<unknown>;
};

const worldBankGdp = async (params: z.infer<typeof DatasetSchema>) => {
  const countries = (params.countries ?? 'IN;US;CN;DE;JP').replace(/,/g, ';').toUpperCase();
  const raw = await fetchJson(`https://api.worldbank.org/v2/country/${countries}/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=300&source=2`) as [unknown, { country?: { id?: string; value?: string }; date?: string; value?: number }[] | null];
  const rows = Array.isArray(raw?.[1]) ? raw[1] : [];
  const grouped: Record<string, { country: string; name: string; observations: { year: string; growth: number | null }[] }> = {};
  for (const row of rows) {
    const code = row.country?.id;
    if (!code || !row.date) continue;
    grouped[code] ??= { country: code, name: row.country?.value ?? code, observations: [] };
    grouped[code].observations.push({ year: row.date, growth: row.value ?? null });
  }
  for (const entry of Object.values(grouped)) {
    entry.observations.sort((a, b) => Number(b.year) - Number(a.year));
    entry.observations = entry.observations.slice(0, 30);
  }
  return { indicator: 'GDP growth (annual %)', source: 'World Bank', lastUpdated: new Date().toISOString().slice(0, 10), countries: Object.values(grouped) };
};

const forexFactoryEvents = async () => {
  const calendars = ['ff_calendar_thisweek.json', 'ff_calendar_nextweek.json', 'ff_calendar_thismonth.json'];
  const results = await Promise.allSettled(calendars.map((name) => fetchJson(`https://nfs.faireconomy.media/${name}`)));
  type RawEvent = { title?: string; country?: string; date?: string; impact?: string; forecast?: string; previous?: string };
  const seen = new Set<string>();
  const events: { title: string; country: string; date: string; impact: string; forecast: string; previous: string }[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const horizon = Date.now() + 40 * 24 * 60 * 60 * 1000;
  for (const result of results) {
    if (result.status !== 'fulfilled' || !Array.isArray(result.value)) continue;
    for (const raw of result.value as RawEvent[]) {
      if (!raw.title || !raw.date || !raw.country) continue;
      const when = new Date(raw.date).getTime();
      if (Number.isNaN(when) || when < cutoff || when > horizon) continue;
      const key = `${raw.title}|${raw.date}|${raw.country}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push({
        title: raw.title.slice(0, 160),
        country: raw.country.slice(0, 3).toUpperCase(),
        date: new Date(raw.date).toISOString(),
        impact: (raw.impact ?? 'Low').toString().slice(0, 12),
        forecast: (raw.forecast ?? '').toString().slice(0, 40),
        previous: (raw.previous ?? '').toString().slice(0, 40),
      });
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return { source: 'ForexFactory (faireconomy media)', fetchedAt: new Date().toISOString(), events: events.slice(0, 120) };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET' && req.method !== 'POST') return jsonResponse({ error: 'Use GET or POST.' }, 405);

  let body: unknown = undefined;
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Request body was not valid JSON.' }, 400);
    }
  }

  const parsed = parseParams(new URL(req.url), body);
  if (!parsed.success) {
    return jsonResponse({ error: 'Invalid parameters.', details: z.treeifyError(parsed.error) }, 400);
  }
  const params = parsed.data;

  try {
    let data: unknown;
    switch (params.dataset) {
      case 'forex-latest':
        data = await fetchJson(frankfurterPath('forex-latest', params));
        break;
      case 'forex-series':
        data = await fetchJson(frankfurterPath('forex-series', params));
        break;
      case 'stocks':
        data = await yahooStocks(params);
        break;
      case 'crypto':
        data = await coingeckoCoins(params);
        break;
      case 'gdp':
        data = await worldBankGdp(params);
        break;
      case 'events':
        data = await forexFactoryEvents();
        break;
    }
    return jsonResponse({ data });
  } catch (error) {
    console.error('market-data error:', String(error));
    const message = error instanceof Error ? error.message : 'unknown error';
    const upstream = /upstream (\d+)/.exec(message);
    return jsonResponse({ error: 'A market-data provider is unavailable right now. Please try again shortly.', detail: upstream ? `provider status ${upstream[1]}` : message.slice(0, 120) }, 502);
  }
});
