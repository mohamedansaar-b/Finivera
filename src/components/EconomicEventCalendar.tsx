import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { callFunction, fetchMarketData, type EconEvent, type EventsData } from '@/lib/marketApi';

const impactClass: Record<string, string> = {
  High: 'bg-destructive text-destructive-foreground',
  Medium: 'bg-warning-orange text-primary-foreground',
  Low: 'bg-chart-green text-primary-foreground',
};

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const EconomicEventCalendar = () => {
  const [data, setData] = useState<EventsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'High' | 'Medium' | 'All'>('High');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [takeaways, setTakeaways] = useState<{ takeaways: string[]; watchpoints: string[] } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchMarketData<EventsData>({ dataset: 'events' })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the calendar.'));
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now() - 3 * 3600000;
    return (data?.events ?? []).filter((e) => new Date(e.date).getTime() >= now && ['High', 'Medium', 'Low'].includes(e.impact));
  }, [data]);

  const shown = useMemo(() => (filter === 'All' ? upcoming : filter === 'High' ? upcoming.filter((e) => e.impact === 'High') : upcoming.filter((e) => e.impact !== 'Low')).slice(0, 24), [upcoming, filter]);

  const generate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const key = upcoming.filter((e) => e.impact === 'High').slice(0, 12);
      const slim = (e: EconEvent) => ({ title: e.title, country: e.country, date: e.date, impact: e.impact, forecast: e.forecast, previous: e.previous });
      const [n, t] = await Promise.all([
        callFunction<{ notes: { title: string; note: string }[] }>('market-summary', { kind: 'event-notes', payload: { events: key.map(slim) } }),
        callFunction<{ takeaways: string[]; watchpoints: string[] }>('market-summary', { kind: 'weekly-takeaways', payload: { today: new Date().toISOString(), events: upcoming.filter((e) => e.impact !== 'Low').slice(0, 40).map(slim) } }),
      ]);
      setNotes(Object.fromEntries(n.notes.map((x) => [x.title, x.note])));
      setTakeaways(t);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI analysis is unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Economic Event Calendar</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Scheduled economic releases with forecasts, previous figures and AI impact notes</p>
          <p className="text-xs text-muted-foreground mt-2">
            Source: {data?.source ?? 'ForexFactory'} · times shown in your time zone ({tz}){data && ` · fetched ${new Date(data.fetchedAt).toLocaleString()}`}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['High', 'Medium', 'All'] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {f === 'High' ? 'High impact' : f === 'Medium' ? 'Medium + High' : 'All events'}
            </Button>
          ))}
          <Button size="sm" variant="glow" onClick={() => void generate()} disabled={aiLoading || upcoming.length === 0}>
            <Sparkles className="h-4 w-4 mr-1" />{aiLoading ? 'Finivera AI is thinking…' : 'Generate AI impact notes'}
          </Button>
        </div>

        {error && <div role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm"><AlertCircle className="h-4 w-4 text-destructive" />{error}</div>}
        {aiError && <div role="alert" className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm"><AlertCircle className="h-4 w-4 text-destructive" />{aiError}</div>}
        {!data && !error && <p className="text-center text-muted-foreground">Loading calendar…</p>}
        {data && shown.length === 0 && <p className="text-center text-muted-foreground">No upcoming events match this filter in the published calendar.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shown.map((e) => (
            <Card key={`${e.title}-${e.date}-${e.country}`} className="bg-gradient-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-electric-blue" />
                    {new Date(e.date).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Badge className={impactClass[e.impact] ?? ''}>{e.impact.toUpperCase()}</Badge>
                </div>
                <CardTitle className="text-foreground text-lg leading-tight">{e.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{e.country}</Badge>
                  <Badge variant="outline">Forecast: {e.forecast || 'n/a'}</Badge>
                  <Badge variant="outline">Previous: {e.previous || 'n/a'}</Badge>
                </div>
              </CardHeader>
              {notes[e.title] && (
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1">AI impact note</h4>
                    <p className="text-sm text-muted-foreground">{notes[e.title]}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning-orange" />This Week's Key Takeaways</CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-generated from the scheduled events above{data && `, as of ${new Date(data.fetchedAt).toLocaleDateString()}`}. Educational only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {takeaways ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div><h4 className="font-semibold text-foreground mb-2">Key takeaways</h4><ul className="space-y-2">{takeaways.takeaways.map((t, i) => <li key={i}>• {t}</li>)}</ul></div>
                <div><h4 className="font-semibold text-foreground mb-2">Watchpoints</h4><ul className="space-y-2">{takeaways.watchpoints.map((t, i) => <li key={i}>• {t}</li>)}</ul></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select "Generate AI impact notes" to create this week's takeaways from the live calendar.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EconomicEventCalendar;
