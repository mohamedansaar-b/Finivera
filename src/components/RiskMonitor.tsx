import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { fetchMarketData, type GdpData } from '@/lib/marketApi';

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
];

type Risk = 'low' | 'medium' | 'high';

// Rule-based classification from the World Bank figures only (not a forecast).
const classify = (latest: number, avg: number): Risk => {
  if (latest < 0 || latest < avg - 2) return 'high';
  if (latest < 1.5 || latest < avg - 0.75) return 'medium';
  return 'low';
};

const riskStyle: Record<Risk, string> = {
  low: 'text-chart-green border-chart-green/20 bg-chart-green/10',
  medium: 'text-warning-orange border-warning-orange/20 bg-warning-orange/10',
  high: 'text-destructive border-destructive/20 bg-destructive/10',
};
const RiskIcon = ({ level }: { level: Risk }) => level === 'low' ? <TrendingUp className="w-5 h-5" /> : level === 'medium' ? <AlertTriangle className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;

const RiskMonitor = () => {
  const [selected, setSelected] = useState('IN');
  const [data, setData] = useState<GdpData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData<GdpData>({ dataset: 'gdp', countries: COUNTRIES.map((c) => c.code).join(';') })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load World Bank data.'));
  }, []);

  const summarize = (code: string) => {
    const c = data?.countries.find((x) => x.country === code);
    if (!c) return null;
    const obs = c.observations.filter((o) => o.growth !== null) as { year: string; growth: number }[];
    if (obs.length === 0) return null;
    const last5 = obs.slice(0, 5).reverse();
    const latest = obs[0];
    const avg = last5.reduce((s, o) => s + o.growth, 0) / last5.length;
    return { latest, last5, avg, risk: classify(latest.growth, avg), prev: obs[1] };
  };

  const current = summarize(selected);
  const name = COUNTRIES.find((c) => c.code === selected)?.name ?? selected;

  return (
    <section id="risk-monitor" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-warning-orange to-destructive bg-clip-text text-transparent">Global Economic Risk Monitor</span>
          </h2>
          <p className="text-xl text-muted-foreground">Annual real GDP growth across major economies</p>
          <p className="text-xs text-muted-foreground mt-2">Source: World Bank, indicator NY.GDP.MKTP.KD.ZG (GDP growth, annual %)</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-center">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-64 bg-card border-electric-blue/30" aria-label="Select a country"><SelectValue /></SelectTrigger>
              <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {error && <div role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm"><AlertCircle className="h-4 w-4 text-destructive" />{error}</div>}
          {!data && !error && <p className="text-center text-muted-foreground">Loading World Bank data…</p>}

          {current && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 p-6 text-center">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Latest GDP Growth</h3>
                  <div className="text-4xl font-bold text-electric-blue mb-2">{current.latest.growth.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">{name} · latest reported year {current.latest.year}</p>
                </Card>
                <Card className={`bg-card/50 backdrop-blur-sm border p-6 text-center ${riskStyle[current.risk]}`}>
                  <h3 className="text-lg font-semibold mb-2">Growth Risk Signal</h3>
                  <div className="flex items-center justify-center gap-2 mb-2"><RiskIcon level={current.risk} /><span className="text-2xl font-bold capitalize">{current.risk}</span></div>
                  <p className="text-sm opacity-80">Latest year vs 5-year average</p>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border border-neon-teal/20 p-6 text-center">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">5-Year Average</h3>
                  <div className="text-4xl font-bold text-neon-teal mb-2">{current.avg.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">{current.last5[0].year}–{current.latest.year}</p>
                </Card>
              </div>

              <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 p-6">
                <h3 className="text-2xl font-bold mb-6 text-center">{name} – GDP Growth, {current.last5[0].year}–{current.latest.year}</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={current.last5}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" unit="%" />
                      <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} formatter={(v: number) => [`${v.toFixed(2)}%`, 'GDP growth']} />
                      <Bar dataKey="growth">{current.last5.map((o) => <Cell key={o.year} fill={o.growth >= 0 ? 'hsl(var(--chart-green))' : 'hsl(var(--destructive))'} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-muted/30 rounded-lg text-muted-foreground text-sm">
                  {name}'s economy grew {current.latest.growth.toFixed(1)}% in {current.latest.year}
                  {current.prev?.growth != null && `, compared with ${current.prev.growth.toFixed(1)}% in ${current.prev.year}`}. The {current.risk} signal compares the latest year with the 5-year average; it is a simple rule, not a forecast.
                </div>
              </Card>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {COUNTRIES.map((c) => {
                  const s = summarize(c.code);
                  return (
                    <Card key={c.code} onClick={() => setSelected(c.code)} className={`p-4 cursor-pointer text-center bg-card/50 border ${c.code === selected ? 'border-electric-blue' : 'border-border/50'}`}>
                      <div className="text-2xl font-bold mb-1">{s ? `${s.latest.growth.toFixed(1)}%` : 'n/a'}</div>
                      <div className="text-sm text-muted-foreground mb-2">{c.name}{s && ` · ${s.latest.year}`}</div>
                      {s && <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${riskStyle[s.risk]}`}><RiskIcon level={s.risk} /><span className="capitalize">{s.risk}</span></div>}
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default RiskMonitor;
