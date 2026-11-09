import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, BarChart3, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { callFunction, fetchMarketData, type CoinQuote, type ForexLatest, type ForexSeries, type StockQuote } from '@/lib/marketApi';

interface ForexRow { pair: string; rate: number; change: number | null; date: string }
interface Summary { sentiment: string; summary: string[]; risks: string[] }

const PAIRS: [string, string][] = [['USD', 'INR'], ['EUR', 'USD'], ['GBP', 'USD'], ['USD', 'JPY']];

const isoDaysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

const Change = ({ value }: { value: number | null }) => value === null ? <span className="text-sm text-muted-foreground">—</span> : (
  <span className={`flex items-center gap-1 text-sm ${value >= 0 ? 'text-chart-green' : 'text-destructive'}`}>
    {value >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
    {value >= 0 ? '+' : ''}{value.toFixed(2)}%
  </span>
);

const Spark = ({ data }: { data: { v: number }[] }) => data.length < 2 ? null : (
  <div className="h-12 mt-2">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}><YAxis hide domain={['dataMin', 'dataMax']} /><Line dataKey="v" dot={false} stroke="hsl(var(--electric-blue))" strokeWidth={2} /></LineChart>
    </ResponsiveContainer>
  </div>
);

const ErrorBox = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
    <AlertCircle className="h-4 w-4 text-destructive" /> {message}
  </div>
);

const AIMarketSummary = () => {
  const [forex, setForex] = useState<ForexRow[]>([]);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [crypto, setCrypto] = useState<CoinQuote[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const nextErrors: Record<string, string> = {};
    const [fx, st, cr] = await Promise.allSettled([
      Promise.all(PAIRS.map(async ([b, q]) => {
        const s = await fetchMarketData<ForexSeries>({ dataset: 'forex-series', base: b, symbols: q, start: isoDaysAgo(10), end: isoDaysAgo(0) });
        const pts = Object.entries(s.rates).sort(([a], [c]) => a.localeCompare(c)).map(([date, r]) => ({ date, rate: r[q] }));
        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        return { pair: `${b}/${q}`, rate: last.rate, date: last.date, change: prev ? ((last.rate - prev.rate) / prev.rate) * 100 : null };
      })),
      fetchMarketData<StockQuote[]>({ dataset: 'stocks', range: '1mo' }),
      fetchMarketData<CoinQuote[]>({ dataset: 'crypto' }),
    ]);
    if (fx.status === 'fulfilled') setForex(fx.value); else nextErrors.forex = 'Exchange rates are unavailable right now.';
    if (st.status === 'fulfilled') setStocks(st.value); else nextErrors.stocks = 'Stock index data is unavailable right now.';
    if (cr.status === 'fulfilled') setCrypto(cr.value); else nextErrors.crypto = 'Crypto prices are unavailable right now (provider rate limit or outage).';
    setErrors(nextErrors);
    setFetchedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const payload = {
        retrievedAt: new Date().toISOString(),
        forex: forex.map((f) => ({ pair: f.pair, rate: f.rate, dayChangePct: f.change, date: f.date, source: 'ECB' })),
        stocks: stocks.map((s) => ({ name: s.name, price: s.price, currency: s.currency, changePct: s.changePercent, asOf: s.marketTime, source: 'Yahoo Finance' })),
        crypto: crypto.map((c) => ({ name: c.name, priceUsd: c.current_price, change24hPct: c.price_change_percentage_24h, asOf: c.last_updated, source: 'CoinGecko' })),
      };
      setSummary(await callFunction<Summary>('market-summary', { kind: 'daily-summary', payload }));
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : 'Could not generate the summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const hasData = forex.length + stocks.length + crypto.length > 0;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">AI-Generated Market Summary</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Retrieved market data, with AI analysis generated only from those figures</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            {fetchedAt && <span>Fetched {fetchedAt.toLocaleString()}</span>}
            <Button variant="ghost" size="sm" className="text-electric-blue" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh Market Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="forex" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="forex"><DollarSign className="h-4 w-4 mr-2" />Forex</TabsTrigger>
            <TabsTrigger value="stocks"><BarChart3 className="h-4 w-4 mr-2" />Stocks</TabsTrigger>
            <TabsTrigger value="crypto"><Bitcoin className="h-4 w-4 mr-2" />Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value="forex" className="space-y-3">
            {errors.forex && <ErrorBox message={errors.forex} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {forex.map((f) => (
                <Card key={f.pair} className="bg-gradient-card border-border"><CardContent className="p-4">
                  <div className="font-semibold text-foreground mb-2">{f.pair}</div>
                  <div className="text-2xl font-bold text-foreground mb-1">{f.rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                  <Change value={f.change} />
                  <p className="text-xs text-muted-foreground mt-2">ECB reference rate · {f.date}</p>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-3">
            {errors.stocks && <ErrorBox message={errors.stocks} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stocks.map((s) => (
                <Card key={s.symbol} className="bg-gradient-card border-border"><CardContent className="p-4">
                  <div className="font-semibold text-foreground mb-2">{s.name}</div>
                  <div className="text-2xl font-bold text-foreground mb-1">{s.price !== null ? `${s.currency === 'INR' ? '₹' : ''}${s.price.toLocaleString()}` : '—'}</div>
                  <Change value={s.changePercent} />
                  <Spark data={s.series.filter((p) => p.close !== null).map((p) => ({ v: p.close as number }))} />
                  <p className="text-xs text-muted-foreground mt-2">Yahoo Finance · may be delayed · {s.marketTime ? new Date(s.marketTime).toLocaleString() : 'n/a'}</p>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-3">
            {errors.crypto && <ErrorBox message={errors.crypto} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {crypto.map((c) => (
                <Card key={c.id} className="bg-gradient-card border-border"><CardContent className="p-4">
                  <div className="font-semibold text-foreground mb-2">{c.name} <span className="text-muted-foreground uppercase text-xs">{c.symbol}</span></div>
                  <div className="text-2xl font-bold text-foreground mb-1">${c.current_price.toLocaleString()}</div>
                  <Change value={c.price_change_percentage_24h} />
                  <p className="text-xs text-muted-foreground mt-2">24h · Mkt cap ${(c.market_cap / 1e9).toFixed(1)}B</p>
                  <p className="text-xs text-muted-foreground">CoinGecko · {new Date(c.last_updated).toLocaleString()}</p>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><Sparkles className="h-5 w-5 text-neon-teal" />Today's Market Summary</CardTitle>
            <CardDescription className="text-muted-foreground">AI-generated analysis based only on the data shown above. Educational, not investment advice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!summary && !summaryLoading && (
              <Button onClick={() => void generateSummary()} disabled={!hasData || loading} className="bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground">Generate AI summary</Button>
            )}
            {summaryLoading && <p className="text-sm text-muted-foreground">Finivera AI is analysing the latest figures…</p>}
            {summaryError && <ErrorBox message={summaryError} />}
            {summary && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-foreground font-medium">Market sentiment: <span className="text-neon-teal">{summary.sentiment}</span></p>
                {summary.summary.map((p, i) => <p key={i}>{p}</p>)}
                {summary.risks.length > 0 && (
                  <div><h4 className="font-semibold text-foreground mb-1">Risks to watch</h4><ul className="space-y-1">{summary.risks.map((r, i) => <li key={i}>• {r}</li>)}</ul></div>
                )}
                <Button variant="outline" size="sm" onClick={() => void generateSummary()}>Regenerate</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIMarketSummary;
