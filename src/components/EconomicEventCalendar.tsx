import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertTriangle, Info } from 'lucide-react';

const addDaysISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
};

const economicEvents = [
  {
    date: addDaysISO(1),
    time: '20:30',
    event: 'US GDP Growth Rate (Q3, 2nd Est.)',
    importance: 'high',
    country: 'US',
    impact: 'Stronger GDP could lift USD; watch USD/INR for a 0.3-0.8% move.',
    currency: 'USD/INR'
  },
  {
    date: addDaysISO(2),
    time: '18:30',
    event: 'ECB Interest Rate Decision',
    importance: 'high',
    country: 'EU',
    impact: 'Dovish tone may weaken EUR and indirectly support USD; monitor EUR/USD and USD/INR cross-effects.',
    currency: 'EUR/USD'
  },
  {
    date: addDaysISO(3),
    time: '14:00',
    event: 'RBI Monetary Policy Meeting',
    importance: 'high',
    country: 'IN',
    impact: 'Status quo could firm INR modestly; a surprise cut may push USD/INR higher.',
    currency: 'USD/INR'
  },
  {
    date: addDaysISO(4),
    time: '21:30',
    event: 'US Core PCE Price Index',
    importance: 'medium',
    country: 'US',
    impact: 'Hotter inflation supports USD; cooler print could soften USD into week-end.',
    currency: 'USD/INR'
  },
  {
    date: addDaysISO(5),
    time: '16:00',
    event: 'India Manufacturing PMI',
    importance: 'medium',
    country: 'IN',
    impact: 'Strong PMI typically supports INR on growth optimism.',
    currency: 'USD/INR'
  },
  {
    date: addDaysISO(6),
    time: '22:00',
    event: 'US Nonfarm Payrolls',
    importance: 'high',
    country: 'US',
    impact: 'Beat may strengthen USD; miss could weigh on USD and ease USD/INR.',
    currency: 'USD/INR'
  }
];

const importanceColors = {
  high: 'bg-destructive',
  medium: 'bg-warning-orange',
  low: 'bg-chart-green'
};

const importanceIcons = {
  high: AlertTriangle,
  medium: TrendingUp,
  low: Info
};

const EconomicEventCalendar = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Economic Event Calendar
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay ahead of market movements with AI insights on upcoming economic events
          </p>
        </div>

        {/* Importance Legend */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-sm text-muted-foreground">High Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-orange"></div>
            <span className="text-sm text-muted-foreground">Medium Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-green"></div>
            <span className="text-sm text-muted-foreground">Low Impact</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {economicEvents.map((event, index) => {
            const ImportanceIcon = importanceIcons[event.importance as keyof typeof importanceIcons];
            
            return (
              <Card key={index} className="bg-gradient-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-electric-blue" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.date)} • {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ImportanceIcon className="h-4 w-4 text-foreground" />
                      <Badge 
                        className={`${importanceColors[event.importance as keyof typeof importanceColors]} text-white text-xs`}
                      >
                        {event.importance.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-foreground text-lg leading-tight">
                    {event.event}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.country}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-electric-blue border-electric-blue">
                      {event.currency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-neon-teal" />
                      AI Market Impact Analysis
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.impact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        <Card className="mt-8 bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-orange" />
              This Week's Key Takeaways
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-generated summary of market expectations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">High Impact Events</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• US GDP and Employment data could drive USD strength</li>
                  <li>• RBI policy meeting crucial for INR direction</li>
                  <li>• ECB rate decision may create cross-currency effects</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Trading Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Monitor USD/INR volatility around 83.20-84.00</li>
                  <li>• Consider hedging positions before RBI announcement</li>
                  <li>• Watch for breakout opportunities post-US employment data</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EconomicEventCalendar;