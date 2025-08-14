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
    { pair: 'USD/INR', current: 83.45, change: '+0.32%', trend: 'up', signal: 'Buy' },
    { pair: 'EUR/USD', current: 1.0892, change: '-0.18%', trend: 'down', signal: 'Hold' },
    { pair: 'GBP/USD', current: 1.2756, change: '+0.09%', trend: 'up', signal: 'Buy' },
    { pair: 'USD/JPY', current: 148.32, change: '+0.45%', trend: 'up', signal: 'Strong Buy' }
  ],
  stocks: [
    { symbol: 'NIFTY 50', current: 21875, change: '+1.2%', trend: 'up', signal: 'Buy' },
    { symbol: 'SENSEX', current: 72394, change: '+0.98%', trend: 'up', signal: 'Buy' },
    { symbol: 'BANK NIFTY', current: 46532, change: '+2.1%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'IT Index', current: 34567, change: '-0.34%', trend: 'down', signal: 'Hold' }
  ],
  crypto: [
    { symbol: 'BTC', current: 42350, change: '+3.2%', trend: 'up', signal: 'Buy' },
    { symbol: 'ETH', current: 2634, change: '+2.8%', trend: 'up', signal: 'Buy' },
    { symbol: 'SOL', current: 98.45, change: '+5.4%', trend: 'up', signal: 'Strong Buy' },
    { symbol: 'ADA', current: 0.487, change: '-1.2%', trend: 'down', signal: 'Hold' }
  ]
};

const opportunities = [
  {
    type: 'Forex',
    title: 'USD/INR Breakout Opportunity',
    description: 'Technical analysis suggests USD/INR may test 84.00 resistance. Consider short-term long positions.',
    timeframe: '3-5 days',
    riskLevel: 'Medium',
    potentialReturn: '0.8-1.2%'
  },
  {
    type: 'Stocks',
    title: 'Banking Sector Rally',
    description: 'RBI policy stance supports banking stocks. BANK NIFTY showing strong momentum.',
    timeframe: '1-2 weeks',
    riskLevel: 'Low',
    potentialReturn: '3-5%'
  },
  {
    type: 'Crypto',
    title: 'Altcoin Season Beginning',
    description: 'SOL and other altcoins showing strong relative strength. Bitcoin dominance declining.',
    timeframe: '2-4 weeks',
    riskLevel: 'High',
    potentialReturn: '15-25%'
  },
  {
    type: 'Savings',
    title: 'High-Yield FD Rates',
    description: 'Several banks offering 7.5-8% on 1-year FDs. Lock in before rate cuts.',
    timeframe: '1 year',
    riskLevel: 'Very Low',
    potentialReturn: '7.5-8%'
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
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
            <Button variant="ghost" size="sm" className="text-electric-blue hover:text-electric-blue/80">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
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
                Market Sentiment: <span className="text-chart-green">Bullish</span>
              </p>
              <p className="mb-4">
                Indian markets continued their upward momentum with NIFTY 50 gaining 1.2% and BANK NIFTY leading with a 2.1% surge. 
                The banking sector benefited from positive RBI policy expectations and strong quarterly results.
              </p>
              <p className="mb-4">
                In forex markets, USD/INR showed strength as the dollar gained against most emerging market currencies. 
                The pair is approaching key resistance at 84.00, which could present trading opportunities.
              </p>
              <p>
                Cryptocurrency markets are showing renewed strength with Bitcoin holding above $42,000 and altcoins 
                outperforming. This suggests a potential shift toward risk-on sentiment in the crypto space.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIMarketSummary;