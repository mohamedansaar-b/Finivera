import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ForexDashboard = () => {
  // Mock forex data for USD/INR prediction
  const forexData = [
    { day: 'Day 1', rate: 83.1, trend: 'up' },
    { day: 'Day 2', rate: 83.2, trend: 'up' },
    { day: 'Day 3', rate: 83.0, trend: 'down' },
    { day: 'Day 4', rate: 83.3, trend: 'up' },
    { day: 'Day 5', rate: 83.4, trend: 'up' },
    { day: 'Day 6', rate: 83.6, trend: 'up' },
    { day: 'Day 7', rate: 83.5, trend: 'down' },
    { day: 'Day 8', rate: 83.7, trend: 'up' },
    { day: 'Day 9', rate: 83.8, trend: 'up' },
    { day: 'Day 10', rate: 83.8, trend: 'stable' },
  ];

  const currentRate = 83.1;
  const predictedRate = 83.8;
  const changePercent = ((predictedRate - currentRate) / currentRate * 100).toFixed(2);

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-chart-green to-electric-blue bg-clip-text text-transparent">
              Forex Prediction Dashboard
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            AI-powered forex predictions and market analysis
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Rate Card */}
          <Card className="bg-card/50 backdrop-blur-sm border border-chart-green/20 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Current Rate</h3>
              <div className="text-4xl font-bold text-foreground mb-2">₹{currentRate}</div>
              <p className="text-sm text-muted-foreground">USD/INR</p>
            </div>
          </Card>

          {/* Predicted Rate Card */}
          <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">10-Day Prediction</h3>
              <div className="text-4xl font-bold text-electric-blue mb-2">₹{predictedRate}</div>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-chart-green" />
                <span className="text-sm text-chart-green">+{changePercent}%</span>
              </div>
            </div>
          </Card>

          {/* Confidence Card */}
          <Card className="bg-card/50 backdrop-blur-sm border border-neon-teal/20 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">AI Confidence</h3>
              <div className="text-4xl font-bold text-neon-teal mb-2">87%</div>
              <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
            </div>
          </Card>
        </div>

        {/* Chart Visualization */}
        <Card className="mt-8 bg-card/50 backdrop-blur-sm border border-electric-blue/20">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-6 text-center">USD/INR Trend – AI Forecast</h3>
            
            {/* Simple Line Chart Visualization */}
            <div className="relative h-64 bg-gradient-to-b from-electric-blue/10 to-transparent rounded-lg p-4">
              <div className="relative h-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                  <span>84.0</span>
                  <span>83.5</span>
                  <span>83.0</span>
                  <span>82.5</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-8 h-full relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 50}
                        x2="400"
                        y2={i * 50}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    ))}
                    
                    {/* Data line */}
                    <polyline
                      fill="none"
                      stroke="hsl(var(--electric-blue))"
                      strokeWidth="3"
                      points={forexData.map((point, index) => {
                        const x = (index / (forexData.length - 1)) * 400;
                        const y = 200 - ((point.rate - 82.5) / 1.5) * 200;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Data points */}
                    {forexData.map((point, index) => {
                      const x = (index / (forexData.length - 1)) * 400;
                      const y = 200 - ((point.rate - 82.5) / 1.5) * 200;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="hsl(var(--electric-blue))"
                          className="hover:r-6 transition-all cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                </div>
                
                {/* X-axis labels */}
                <div className="ml-8 mt-2 flex justify-between text-xs text-muted-foreground">
                  {forexData.filter((_, index) => index % 2 === 0).map((point, index) => (
                    <span key={index}>{point.day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-chart-green" />
                  <span className="font-semibold">Bullish Trend</span>
                </div>
                <p className="text-sm text-muted-foreground">USD/INR showing upward momentum over the forecast period</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-electric-blue rounded-full"></div>
                  <span className="font-semibold">Volatility: Low</span>
                </div>
                <p className="text-sm text-muted-foreground">Expected price movements within normal range</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-warning-orange rounded-full"></div>
                  <span className="font-semibold">Key Level: ₹83.5</span>
                </div>
                <p className="text-sm text-muted-foreground">Critical resistance level to monitor</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ForexDashboard;