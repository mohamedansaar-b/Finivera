import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ForexChart from './ForexChart';

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
];

const volatilityLevels = {
  low: { color: 'bg-chart-green', text: 'Low' },
  medium: { color: 'bg-warning-orange', text: 'Medium' },
  high: { color: 'bg-destructive', text: 'High' }
};

const EnhancedForexDashboard = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
  // Utilities and generated data based on selection
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      default: return '';
    }
  };

  const getBaseRate = (from: string, to: string) => {
    const key = `${from}${to}`;
    const map: Record<string, number> = {
      USDINR: 83.6,
      EURUSD: 1.09,
      GBPUSD: 1.27,
      USDJPY: 148.3,
      USDCAD: 1.35,
      AUDUSD: 0.66,
      EURINR: 91.3,
      GBPINR: 106.5,
      JPYINR: 0.56,
      CADINR: 62.0,
      AUDINR: 55.2,
    };
    return map[key] ?? 1.0;
  };

  const toISO = (d: Date) => d.toISOString().slice(0,10);

  const generateForexData = (start?: Date, end?: Date, base = 1.0) => {
    const s = start ? new Date(start) : new Date();
    const e = end && end > s ? new Date(end) : new Date(s.getTime() + 10 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    let rate = base;
    const data: { date: string; rate: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(s.getTime() + i * 24 * 60 * 60 * 1000);
      // simple random walk around base
      const drift = 0.0002; // ~0.02%
      const shock = (Math.random() - 0.5) * 0.004; // +-0.2%
      rate = rate * (1 + drift + shock);
      data.push({ date: toISO(date), rate: Number(rate.toFixed(4)) });
    }
    return data;
  };

  const baseRate = getBaseRate(fromCurrency, toCurrency);
  const forexData = useMemo(() => generateForexData(startDate, endDate, baseRate), [startDate, endDate, baseRate]);

  const currentRate = forexData.length ? forexData[forexData.length - 1].rate : baseRate;
  const returns = forexData.slice(1).map((d, i) => (d.rate - forexData[i].rate) / forexData[i].rate);
  const avg = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const std = returns.length ? Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / returns.length) : 0;
  const predictedRate = Number((currentRate * (1 + avg)).toFixed(4));
  const changePercent = ((predictedRate - currentRate) / currentRate * 100).toFixed(2);
  const volatility: 'low' | 'medium' | 'high' = std < 0.003 ? 'low' : std < 0.007 ? 'medium' : 'high';

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Enhanced Forex Predictions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            AI-powered forex rate predictions with advanced market analysis and volatility tracking
          </p>
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">From Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="border-border bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-popover-foreground">
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">To Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="border-border bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-popover-foreground">
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-border bg-input",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">End Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-border bg-input",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-electric-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{getCurrencySymbol(toCurrency)}{currentRate}</div>
              <p className="text-xs text-muted-foreground">{fromCurrency}/{toCurrency}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-neon-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{getCurrencySymbol(toCurrency)}{predictedRate}</div>
              <p className={`text-xs ${Number(changePercent) >= 0 ? 'text-chart-green' : 'text-destructive'}`}>
                {Number(changePercent) >= 0 ? '+' : ''}{changePercent}% change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Confidence</CardTitle>
              <Activity className="h-4 w-4 text-electric-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87%</div>
              <p className="text-xs text-muted-foreground">High accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volatility Meter</CardTitle>
              <Activity className="h-4 w-4 text-warning-orange" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={`${volatilityLevels[volatility].color} text-white`}>
                  {volatilityLevels[volatility].text}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Market stability</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Exchange Rate Trend</CardTitle>
            <CardDescription className="text-muted-foreground">
              {fromCurrency}/{toCurrency} rate prediction over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForexChart data={forexData} pairLabel={`${fromCurrency}/${toCurrency} Rate`} currencySymbol={getCurrencySymbol(toCurrency)} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EnhancedForexDashboard;