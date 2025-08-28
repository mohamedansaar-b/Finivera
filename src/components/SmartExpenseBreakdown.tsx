import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Upload, DollarSign, TrendingDown, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const expenseCategories = [
  { name: 'Food & Dining', value: 2800, color: '#00BFFF' },
  { name: 'Transportation', value: 1500, color: '#00FFFF' },
  { name: 'Bills & Utilities', value: 3200, color: '#FFB84D' },
  { name: 'Shopping', value: 1800, color: '#FF6B6B' },
  { name: 'Entertainment', value: 800, color: '#4ECDC4' },
  { name: 'Healthcare', value: 600, color: '#95E1D3' },
];

const moneySavingTips = [
  {
    category: 'Food & Dining',
    tip: 'Cook at home 3 more days per week to save ₹800-1000/month',
    potential: '₹900'
  },
  {
    category: 'Bills & Utilities',
    tip: 'Switch to LED bulbs and optimize AC usage to reduce electricity by 15%',
    potential: '₹480'
  },
  {
    category: 'Shopping',
    tip: 'Use cashback apps and wait for sales for non-essential purchases',
    potential: '₹360'
  }
];

const SmartExpenseBreakdown = () => {
  const [expenseInput, setExpenseInput] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setShowResults(true);
  };

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-popover-foreground font-medium">{data.name}</p>
          <p className="text-electric-blue">₹{data.value.toLocaleString()}</p>
          <p className="text-muted-foreground text-sm">
            {((data.value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Smart Expense Breakdown
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your expense data and get AI-powered insights with personalized money-saving suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-electric-blue" />
                Upload Expense Data
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your monthly expenses or upload a CSV file for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expenses" className="text-foreground">Monthly Expenses</Label>
                <Textarea
                  id="expenses"
                  placeholder="Enter expenses like:
Food: 2800
Transport: 1500
Bills: 3200
Shopping: 1800
Entertainment: 800"
                  value={expenseInput}
                  onChange={(e) => setExpenseInput(e.target.value)}
                  className="mt-1 border-border bg-input text-foreground min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="file-upload" className="text-foreground">Or Upload CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  className="mt-1 border-border bg-input text-foreground"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground"
              >
                Analyze Expenses
              </Button>
            </CardContent>
          </Card>

          {/* Results Preview */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-neon-teal" />
                Expense Overview
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {showResults ? `Total Monthly Expenses: ₹${totalExpenses.toLocaleString()}` : 'Upload data to view expenses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showResults ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Files or Expenses Uploaded</p>
                  <p className="text-sm">Please upload your expense data above to see the breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {expenseCategories.map((category) => (
              <Card key={category.name} className="bg-gradient-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{category.name}</p>
                      <p className="text-lg font-semibold text-foreground">₹{category.value.toLocaleString()}</p>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((category.value / totalExpenses) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Money Saving Suggestions */}
        {showResults && (
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning-orange" />
                Top 3 Money-Saving Suggestions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-powered recommendations to optimize your spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moneySavingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-electric-blue text-primary-foreground text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {tip.category}
                        </Badge>
                        <Badge className="bg-chart-green text-white text-xs">
                          Save {tip.potential}/month
                        </Badge>
                      </div>
                      <p className="text-foreground text-sm">{tip.tip}</p>
                    </div>
                    <TrendingDown className="h-4 w-4 text-chart-green" />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-chart-green/10 border border-chart-green/20">
                <p className="text-foreground font-semibold">
                  Total Potential Savings: ₹1,740/month (₹20,880/year)
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Implementing these suggestions could reduce your expenses by 18.9%
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default SmartExpenseBreakdown;