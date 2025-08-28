import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bitcoin, 
  BarChart3, 
  Lightbulb,
  RefreshCw,
  Clock
} from 'lucide-react';

const marketData = {
  forex: [
    { pair: 'USD/INR', current: 84.15, change: '+0.85%', trend: 'up', signal: 'Buy' },
    { pair: 'EUR/USD', current: 1.0815, change: '-0.35%', trend: 'down', signal: 'Hold' },
    { pair: 'GBP/USD', current: 1.3125, change: '+0.42%', trend: 'up', signal: 'Buy' },
    { pair: 'USD/JPY', current: 146.25, change: '-1.4%', trend: 'down', signal: 'Sell' }
  ],
  stocks: [
    { symbol: 'NIFTY 50', current: 24875, change: '+2.8%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'SENSEX', current: 81249, change: '+2.5%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'BANK NIFTY', current: 52845, change: '+3.7%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'IT Index', current: 41250, change: '+1.9%', trend: 'up', signal: 'Buy' }
  ],
  crypto: [
    { symbol: 'BTC', current: 63450, change: '+4.8%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'ETH', current: 3185, change: '+3.2%', trend: 'up', signal: 'Buy' },
    { symbol: 'SOL', current: 142.75, change: '+7.1%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'ADA', current: 0.68, change: '+12.5%', trend: 'up', signal: 'Buy' }
  ]
};

const opportunities = [
  {
    type: 'Forex',
    title: 'USD/INR Testing Key Resistance',
    description: 'USD/INR breaking above 84.50 could trigger momentum to 85.20. Monitor for pullback entries.',
    timeframe: '5-7 days',
    riskLevel: 'Medium',
    potentialReturn: '1.2-1.8%'
  },
  {
    type: 'Stocks',
    title: 'Tech Sector Recovery',
    description: 'IT stocks benefiting from AI boom and stable dollar rates. NIFTY IT showing breakout patterns.',
    timeframe: '2-3 weeks',
    riskLevel: 'Medium',
    potentialReturn: '8-12%'
  },
  {
    type: 'Crypto',
    title: 'Bitcoin ETF Inflows Surge',
    description: 'Institutional demand driving BTC above $63K. Altcoins following with strong momentum.',
    timeframe: '3-6 weeks',
    riskLevel: 'High',
    potentialReturn: '20-35%'
  },
  {
    type: 'Savings',
    title: 'Government Bond Opportunity',
    description: 'Long-term government securities offering 7.8-8.2% yields before potential rate cuts.',
    timeframe: '10 years',
    riskLevel: 'Very Low',
    potentialReturn: '7.8-8.2%'
  }
];

const AIMarketSummary = () => {
  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-chart-green" /> : 
      <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Strong Buy': return 'bg-chart-green text-white';
      case 'Buy': return 'bg-chart-green/80 text-white';
      case 'Hold': return 'bg-warning-orange text-white';
      case 'Sell': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very Low': return 'bg-chart-green text-white';
      case 'Low': return 'bg-chart-green/80 text-white';
      case 'Medium': return 'bg-warning-orange text-white';
      case 'High': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            AI-Generated Market Summary
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time market analysis and investment opportunities powered by artificial intelligence
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="ghost" size="sm" className="text-electric-blue hover:text-electric-blue/80" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh Market Data
            </Button>
          </div>
        </div>

        {/* Market Data Tabs */}
        <Tabs defaultValue="forex" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="forex" className="data-[state=active]:bg-electric-blue data-[state=active]:text-primary-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              Forex
            </TabsTrigger>
            <TabsTrigger value="stocks" className="data-[state=active]:bg-electric-blue data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-electric-blue data-[state=active]:text-primary-foreground">
              <Bitcoin className="h-4 w-4 mr-2" />
              Crypto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forex">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.forex.map((item, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{item.pair}</span>
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {item.current}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${item.trend === 'up' ? 'text-chart-green' : 'text-destructive'}`}>
                        {item.change}
                      </span>
                      <Badge className={getSignalColor(item.signal)}>
                        {item.signal}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stocks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.stocks.map((item, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{item.symbol}</span>
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {item.current.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${item.trend === 'up' ? 'text-chart-green' : 'text-destructive'}`}>
                        {item.change}
                      </span>
                      <Badge className={getSignalColor(item.signal)}>
                        {item.signal}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crypto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.crypto.map((item, index) => (
                <Card key={index} className="bg-gradient-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{item.symbol}</span>
                      {getTrendIcon(item.trend)}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      ${item.current.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${item.trend === 'up' ? 'text-chart-green' : 'text-destructive'}`}>
                        {item.change}
                      </span>
                      <Badge className={getSignalColor(item.signal)}>
                        {item.signal}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Investment Opportunities */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning-orange" />
              AI-Detected Investment Opportunities
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Personalized recommendations based on current market conditions and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        {opportunity.type}
                      </Badge>
                      <h4 className="font-semibold text-foreground">{opportunity.title}</h4>
                    </div>
                    <Badge className={getRiskColor(opportunity.riskLevel)}>
                      {opportunity.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {opportunity.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Timeframe: <span className="text-foreground">{opportunity.timeframe}</span>
                      </span>
                    </div>
                    <span className="text-chart-green font-semibold">
                      {opportunity.potentialReturn}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary */}
        <Card className="mt-8 bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Today's Market Summary</CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-generated analysis of key market movements and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-foreground font-medium mb-2">
                Market Sentiment: <span className="text-chart-green">Strongly Bullish</span>
              </p>
              <p className="mb-4">
                Indian markets hit new highs with NIFTY 50 surging 2.8% to 24,875 and SENSEX crossing 81,000 for the first time. 
                Technology and banking sectors led the rally on strong earnings and positive global cues.
              </p>
              <p className="mb-4">
                USD/INR broke above 84.15 as the dollar strengthened on Fed policy expectations. 
                The pair is testing key resistance at 84.50 with potential for further upside toward 85.20.
              </p>
              <p>
                Cryptocurrency markets experienced a massive rally with Bitcoin breaking $63,000 and altcoins posting double-digit gains. 
                Institutional inflows and ETF demand are driving the crypto renaissance of late August 2025.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIMarketSummary;