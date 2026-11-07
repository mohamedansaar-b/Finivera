import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import ForexChart from './ForexChart';
import { fetchMarketData, type ForexSeries } from '@/lib/marketApi';

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
];

const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$' };

const volatilityLevels = {
  low: { className: 'bg-chart-green text-primary-foreground', text: 'Low' },
  medium: { className: 'bg-warning-orange text-primary-foreground', text: 'Medium' },
  high: { className: 'bg-destructive text-destructive-foreground', text: 'High' },
};

const isoDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const EnhancedForexDashboard = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [startDate, setStartDate] = useState(isoDaysAgo(90));
  const [endDate, setEndDate] = useState(isoDaysAgo(0));
  const [series, setSeries] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (fromCurrency === toCurrency) {
      setError('Choose two different currencies.');
      setSeries([]);
      return;
    }
    if (startDate > endDate) {
      setError('Start date must be before end date.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketData<ForexSeries>({ dataset: 'forex-series', base: fromCurrency, symbols: toCurrency, start: startDate, end: endDate });
      const points = Object.entries(data.rates)
        .map(([date, rates]) => ({ date, rate: rates[toCurrency] }))
        .filter((p) => typeof p.rate === 'number')
        .sort((a, b) => a.date.localeCompare(b.date));
      setSeries(points);
      setFetchedAt(new Date());
      if (points.length === 0) setError('No published rates exist for this date range.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load exchange rates.');
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, startDate, endDate]);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => {
    if (series.length < 2) return null;
    const latest = series[series.length - 1];
    const prev = series[series.length - 2];
    const first = series[0];
    const returns = series.slice(1).map((d, i) => (d.rate - series[i].rate) / series[i].rate);
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std = Math.sqrt(returns.reduce((s, r) => s + (r - avg) ** 2, 0) / returns.length);
    const recent = returns.slice(-20);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const estimate = latest.rate * (1 + recentAvg * 5);
    return {
      latest,
      dayChange: ((latest.rate - prev.rate) / prev.rate) * 100,
      periodChange: ((latest.rate - first.rate) / first.rate) * 100,
      dailyVolPct: std * 100,
      volatility: (std < 0.003 ? 'low' : std < 0.007 ? 'medium' : 'high') as keyof typeof volatilityLevels,
      estimate,
      estimateChange: ((estimate - latest.rate) / latest.rate) * 100,
    };
  }, [series]);

  const sym = symbols[toCurrency] ?? '';
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });

  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border-border bg-input" aria-label={label}><SelectValue /></SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );

  const dateField = (value: string, onChange: (v: string) => void, label: string) => (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent>
        <Input type="date" aria-label={label} value={value} min="1999-01-04" max={isoDaysAgo(0)} onChange={(e) => e.target.value && onChange(e.target.value)} className="border-border bg-input" />
      </CardContent>
    </Card>
  );

  return (
    <section id="forex-dashboard" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Forex Prediction</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Official daily reference rates with a volatility meter and a clearly labelled trend estimate
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-muted-foreground">
            <span>Source: European Central Bank reference rates (via Frankfurter)</span>
            {stats && <span>· Latest published rate: {stats.latest.date}</span>}
            {fetchedAt && <span>· Fetched {fetchedAt.toLocaleTimeString()}</span>}
            <Button variant="ghost" size="sm" className="text-electric-blue" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {select(fromCurrency, setFromCurrency, 'From Currency')}
          {select(toCurrency, setToCurrency, 'To Currency')}
          {dateField(startDate, setStartDate, 'Start Date')}
          {dateField(endDate, setEndDate, 'End Date')}
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Latest Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-electric-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats ? `${sym}${fmt(stats.latest.rate)}` : '—'}</div>
              <p className={`text-xs ${stats && stats.dayChange < 0 ? 'text-destructive' : 'text-chart-green'}`}>
                {stats ? `${stats.dayChange >= 0 ? '+' : ''}${stats.dayChange.toFixed(2)}% vs previous day` : `${fromCurrency}/${toCurrency}`}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Period Change</CardTitle>
              <Activity className="h-4 w-4 text-electric-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats ? `${stats.periodChange >= 0 ? '+' : ''}${stats.periodChange.toFixed(2)}%` : '—'}</div>
              <p className="text-xs text-muted-foreground">{series.length} published observations</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trend Estimate (5 days)</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats ? `${sym}${fmt(stats.estimate)}` : '—'}</div>
              <p className="text-xs text-muted-foreground">
                {stats ? `${stats.estimateChange >= 0 ? '+' : ''}${stats.estimateChange.toFixed(2)}% · statistical estimate, not a guarantee` : 'Needs at least 2 observations'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volatility Meter</CardTitle>
              <Activity className="h-4 w-4 text-warning-orange" />
            </CardHeader>
            <CardContent>
              {stats ? <Badge className={volatilityLevels[stats.volatility].className}>{volatilityLevels[stats.volatility].text}</Badge> : <span className="text-2xl font-bold">—</span>}
              <p className="text-xs text-muted-foreground mt-1">{stats ? `Daily std. dev. ${stats.dailyVolPct.toFixed(2)}%` : 'Market stability'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Historical Exchange Rate</CardTitle>
            <CardDescription className="text-muted-foreground">
              {fromCurrency}/{toCurrency} actual published rates, {startDate} to {endDate}. ECB publishes on working days only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && series.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">Loading rates…</div>
            ) : (
              <ForexChart data={series} pairLabel={`${fromCurrency}/${toCurrency}`} currencySymbol={sym} />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EnhancedForexDashboard;
