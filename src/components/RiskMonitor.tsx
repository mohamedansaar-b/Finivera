import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface CountryData {
  name: string;
  code: string;
  gdpGrowth: number[];
  currentGdp: number;
  riskLevel: 'low' | 'medium' | 'high';
  outlook: string;
}

const RiskMonitor = () => {
  const [selectedCountry, setSelectedCountry] = useState('india');

  const countryData: Record<string, CountryData> = {
    india: {
      name: 'India',
      code: 'IN',
      gdpGrowth: [6.8, 7.2, 7.6, 8.1, 8.4],
      currentGdp: 8.4,
      riskLevel: 'low',
      outlook: 'Strong domestic demand and tech sector boom driving robust growth'
    },
    usa: {
      name: 'United States',
      code: 'US',
      gdpGrowth: [2.8, 2.4, 2.9, 3.2, 3.0],
      currentGdp: 3.0,
      riskLevel: 'medium',
      outlook: 'Steady growth amid AI investment surge and labor market resilience'
    },
    china: {
      name: 'China',
      code: 'CN',
      gdpGrowth: [4.5, 4.8, 5.2, 5.0, 4.7],
      currentGdp: 4.7,
      riskLevel: 'medium',
      outlook: 'Recovery momentum slowing due to property sector and demographic challenges'
    },
    germany: {
      name: 'Germany',
      code: 'DE',
      gdpGrowth: [1.2, 1.8, 2.1, 2.4, 2.2],
      currentGdp: 2.2,
      riskLevel: 'low',
      outlook: 'Green energy transition creating new growth opportunities'
    },
    japan: {
      name: 'Japan',
      code: 'JP',
      gdpGrowth: [1.2, 0.8, 1.1, 1.5, 1.8],
      currentGdp: 1.8,
      riskLevel: 'medium',
      outlook: 'Modest recovery driven by tourism revival and tech innovation'
    }
  };

  const selectedData = countryData[selectedCountry];
  const years = ['2021', '2022', '2023', '2024', '2025'];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-chart-green border-chart-green/20 bg-chart-green/10';
      case 'medium': return 'text-warning-orange border-warning-orange/20 bg-warning-orange/10';
      case 'high': return 'text-destructive border-destructive/20 bg-destructive/10';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <TrendingUp className="w-5 h-5" />;
      case 'medium': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <TrendingDown className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <section id="risk-monitor" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-warning-orange to-destructive bg-clip-text text-transparent">
              Global Economic Risk Monitor
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Monitor GDP growth trends and economic risks across major economies
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Country Selector */}
          <div className="mb-8 flex justify-center">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-64 bg-card border-electric-blue/30">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(countryData).map(([key, country]) => (
                  <SelectItem key={key} value={key}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Current GDP Growth</h3>
                <div className="text-4xl font-bold text-electric-blue mb-2">{selectedData.currentGdp}%</div>
                <p className="text-sm text-muted-foreground">{selectedData.name}</p>
              </div>
            </Card>

            <Card className={`bg-card/50 backdrop-blur-sm border p-6 ${getRiskColor(selectedData.riskLevel)}`}>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Risk Level</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getRiskIcon(selectedData.riskLevel)}
                  <span className="text-2xl font-bold capitalize">{selectedData.riskLevel}</span>
                </div>
                <p className="text-sm opacity-80">Economic Risk Assessment</p>
              </div>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-neon-teal/20 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">5-Year Average</h3>
                <div className="text-4xl font-bold text-neon-teal mb-2">
                  {(selectedData.gdpGrowth.reduce((a, b) => a + b, 0) / selectedData.gdpGrowth.length).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">GDP Growth</p>
              </div>
            </Card>
          </div>

          {/* GDP Growth Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">
                {selectedData.name} - 5 Year GDP Growth Trend
              </h3>
              
              <div className="relative h-64 bg-gradient-to-b from-electric-blue/10 to-transparent rounded-lg p-4">
                <div className="relative h-full">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                    <span>10%</span>
                    <span>5%</span>
                    <span>0%</span>
                    <span>-5%</span>
                    <span>-10%</span>
                  </div>
                  
                  {/* Chart area */}
                  <div className="ml-12 h-full relative">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Grid lines */}
                      {[0, 40, 80, 120, 160, 200].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y}
                          x2="400"
                          y2={y}
                          stroke="hsl(var(--border))"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      ))}
                      
                      {/* Zero line */}
                      <line
                        x1="0"
                        y1="120"
                        x2="400"
                        y2="120"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                      
                      {/* Bars */}
                      {selectedData.gdpGrowth.map((growth, index) => {
                        const x = (index / (selectedData.gdpGrowth.length - 1)) * 360 + 20;
                        const barHeight = Math.abs(growth) * 8;
                        const y = growth >= 0 ? 120 - barHeight : 120;
                        const color = growth >= 0 ? 'hsl(var(--chart-green))' : 'hsl(var(--destructive))';
                        
                        return (
                          <rect
                            key={index}
                            x={x - 15}
                            y={y}
                            width="30"
                            height={barHeight}
                            fill={color}
                            opacity="0.8"
                            className="hover:opacity-100 transition-opacity cursor-pointer"
                          />
                        );
                      })}
                      
                      {/* Data labels */}
                      {selectedData.gdpGrowth.map((growth, index) => {
                        const x = (index / (selectedData.gdpGrowth.length - 1)) * 360 + 20;
                        const y = growth >= 0 ? 120 - Math.abs(growth) * 8 - 10 : 120 + Math.abs(growth) * 8 + 20;
                        
                        return (
                          <text
                            key={index}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            className="text-xs fill-current"
                            fill="hsl(var(--foreground))"
                          >
                            {growth}%
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="ml-12 mt-2 flex justify-between text-xs text-muted-foreground">
                    {years.map((year) => (
                      <span key={year}>{year}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outlook */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-electric-blue rounded-full"></div>
                  Economic Outlook
                </h4>
                <p className="text-muted-foreground">{selectedData.outlook}</p>
              </div>
            </div>
          </Card>

          {/* Global Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(countryData).map(([key, country]) => (
              <Card 
                key={key} 
                className={`p-4 cursor-pointer transition-all hover:scale-105 bg-card/50 backdrop-blur-sm border ${
                  key === selectedCountry ? 'border-electric-blue' : 'border-border/50'
                }`}
                onClick={() => setSelectedCountry(key)}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{country.currentGdp}%</div>
                  <div className="text-sm text-muted-foreground mb-2">{country.name}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRiskColor(country.riskLevel)}`}>
                    {getRiskIcon(country.riskLevel)}
                    <span className="capitalize">{country.riskLevel}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskMonitor;