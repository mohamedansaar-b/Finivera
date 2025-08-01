import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ForexChartProps {
  data: Array<{
    date: string;
    rate: number;
  }>;
}

const ForexChart = ({ data }: ForexChartProps) => {
  const chartConfig = {
    rate: {
      label: "USD/INR Rate",
      color: "hsl(var(--electric-blue))",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="date" 
          className="fill-muted-foreground text-xs"
        />
        <YAxis 
          domain={['dataMin - 0.1', 'dataMax + 0.1']}
          className="fill-muted-foreground text-xs"
          tickFormatter={(value) => `₹${value}`}
        />
        <ChartTooltip 
          content={<ChartTooltipContent 
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value, name) => [
              `₹${Number(value).toFixed(2)}`,
              'USD/INR Rate'
            ]}
          />} 
        />
        <Line 
          type="monotone" 
          dataKey="rate" 
          stroke="hsl(var(--electric-blue))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--electric-blue))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'hsl(var(--electric-blue))', strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

export default ForexChart;