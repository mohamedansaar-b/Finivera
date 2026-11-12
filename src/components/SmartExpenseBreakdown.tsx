import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Upload, DollarSign, Lightbulb, Trash2 } from 'lucide-react';
import { parseExpenses, totalsByCategory, type Expense } from '@/lib/finance';

const STORAGE_KEY = 'finivera-expenses-v1';
const COLORS = ['hsl(var(--electric-blue))', 'hsl(var(--neon-teal))', 'hsl(var(--warning-orange))', 'hsl(var(--destructive))', 'hsl(var(--chart-green))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--accent))'];

const TIPS: Record<string, string> = {
  'Food & Dining': 'Plan weekly meals and cook at home more often; set a fixed monthly limit for ordering in.',
  Transportation: 'Combine trips, use public transport or car-pooling for regular routes.',
  'Bills & Utilities': 'Review subscriptions, mobile/internet plans and electricity use; compare cheaper plans.',
  Shopping: 'Use a 48-hour wait rule for non-essential purchases and a monthly shopping cap.',
  Entertainment: 'Cancel unused streaming services and rotate subscriptions instead of keeping all.',
  Healthcare: 'Check whether health insurance covers recurring costs and use generic medicines where advised.',
  Education: 'Look for scholarships, free courses or second-hand books before buying new.',
  Other: 'Label these expenses more specifically so you can see where the money goes.',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const SmartExpenseBreakdown = () => {
  const [input, setInput] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
  });
  const [rejected, setRejected] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }, [expenses]);

  const analyze = (text: string) => {
    const { expenses: parsed, rejected: bad } = parseExpenses(text);
    setRejected(bad);
    if (parsed.length) setExpenses((cur) => [...cur, ...parsed]);
    setInput('');
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) { setRejected([`${file.name}: please upload a .csv file`]); return; }
    analyze(await file.text());
  };

  const filtered = useMemo(() => expenses.filter((e) => {
    if (!fromDate && !toDate) return true;
    if (!e.date) return false;
    return (!fromDate || e.date >= fromDate) && (!toDate || e.date <= toDate);
  }), [expenses, fromDate, toDate]);
  const { total, categories } = useMemo(() => totalsByCategory(filtered), [filtered]);
  const hasDates = expenses.some((e) => e.date);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Smart Expense Breakdown</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Enter or upload your own expenses to see category totals, percentages and saving ideas. Data stays in this browser.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2"><Upload className="h-5 w-5 text-electric-blue" />Add Expenses</CardTitle>
              <CardDescription>One per line: "Food: 2800" or CSV "2026-10-01,Swiggy dinner,450"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expenses">Expenses</Label>
                <Textarea id="expenses" value={input} onChange={(e) => setInput(e.target.value)} placeholder={'Groceries: 2800\nUber: 1500\nElectricity bill: 3200'} className="mt-1 bg-input min-h-[120px]" />
              </div>
              <div>
                <Label htmlFor="file-upload">Or upload a CSV file (date,description,amount[,category])</Label>
                <Input id="file-upload" type="file" accept=".csv" className="mt-1 bg-input" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
              </div>
              <Button onClick={() => analyze(input)} disabled={!input.trim()} className="w-full">Analyze Expenses</Button>
              {rejected.length > 0 && <p className="text-xs text-destructive">Could not read: {rejected.slice(0, 5).join(' | ')}</p>}
              {expenses.length > 0 && <Button variant="outline" size="sm" onClick={() => { setExpenses([]); setRejected([]); }}><Trash2 className="h-4 w-4 mr-1" />Clear all ({expenses.length})</Button>}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2"><DollarSign className="h-5 w-5 text-neon-teal" />Expense Overview</CardTitle>
              <CardDescription>{total > 0 ? `Total: ${fmt(total)} across ${filtered.length} entries` : 'No files or expenses have been uploaded.'}</CardDescription>
            </CardHeader>
            <CardContent>
              {hasDates && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Input type="date" aria-label="From date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-input" />
                  <Input type="date" aria-label="To date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-input" />
                </div>
              )}
              {total > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categories} dataKey="value" nameKey="name" innerRadius={60} outerRadius={120} paddingAngle={3}>
                        {categories.map((c, i) => <Cell key={c.name} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} formatter={(v: number, n: string) => [`${fmt(v)} (${((v / total) * 100).toFixed(1)}%)`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">No files or expenses have been uploaded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {total > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {categories.map((c, i) => (
                <Card key={c.name} className="bg-gradient-card border-border"><CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground">{c.name}</p><p className="text-lg font-semibold text-foreground">{fmt(c.value)}</p></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.percent.toFixed(1)}% of total</p>
                </CardContent></Card>
              ))}
            </div>
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2"><Lightbulb className="h-5 w-5 text-warning-orange" />Top 3 Money-Saving Suggestions</CardTitle>
                <CardDescription>Based on your three largest spending categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.slice(0, 3).map((c, i) => (
                  <div key={c.name} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-electric-blue text-primary-foreground text-sm font-semibold">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1"><Badge variant="outline">{c.name}</Badge><Badge variant="outline">{fmt(c.value)} · {c.percent.toFixed(1)}%</Badge></div>
                      <p className="text-sm text-foreground">{TIPS[c.name] ?? TIPS.Other} Cutting this category by 10% would save {fmt(c.value * 0.1)}.</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
};

export default SmartExpenseBreakdown;
