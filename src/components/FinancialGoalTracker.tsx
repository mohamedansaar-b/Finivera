import { useEffect, useState } from 'react';
import { monthsUntil, requiredMonthly } from '@/lib/finance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  DollarSign,
  PiggyBank,
  Trash2
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  monthlyContribution: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
}

const STORAGE_KEY = 'finivera-goals-v1';
const loadGoals = (): Goal[] => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; } };

const goalCategories = [
  'Emergency',
  'Property',
  'Education',
  'Retirement',
  'Lifestyle',
  'Investment',
  'Other'
];

const FinancialGoalTracker = () => {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); }, [goals]);
  const updateSaved = (id: string, value: string) => setGoals((cur) => cur.map((g) => g.id === id ? { ...g, currentAmount: Math.max(Number(value) || 0, 0) } : g));
  const removeGoal = (id: string) => setGoals((cur) => cur.filter((g) => g.id !== id));
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: '',
    monthlyContribution: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-chart-green text-white';
      case 'on-track': return 'bg-electric-blue text-white';
      case 'ahead': return 'bg-neon-teal text-primary-foreground';
      case 'behind': return 'bg-warning-orange text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on-track': return <Target className="h-4 w-4" />;
      case 'ahead': return <TrendingUp className="h-4 w-4" />;
      case 'behind': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const calculateProgress = (current: number, target: number) => target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const statusOf = (g: Goal): Goal['status'] => {
    if (g.currentAmount >= g.targetAmount) return 'completed';
    const need = requiredMonthly(g.targetAmount, g.currentAmount, g.targetDate);
    if (g.monthlyContribution >= need * 1.2) return 'ahead';
    if (g.monthlyContribution >= need) return 'on-track';
    return 'behind';
  };

  const calculateMonthsRemaining = (targetDate: string) => monthsUntil(targetDate);

  const getAdjustmentSuggestion = (goal: Goal) => {
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
    if (remaining === 0) return 'Goal reached. Consider moving these savings into a suitable low-risk option until you use them.';
    const months = monthsUntil(goal.targetDate);
    const need = requiredMonthly(goal.targetAmount, goal.currentAmount, goal.targetDate);
    const r = (n: number) => `₹${Math.ceil(n).toLocaleString('en-IN')}`;
    if (months === 0) return `The target date has arrived with ${r(remaining)} still remaining. Extend the date or add a lump sum.`;
    if (goal.monthlyContribution < need) {
      const monthsAtCurrent = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;
      return `You need ${r(need)}/month for ${months} months. Increase your contribution by ${r(need - goal.monthlyContribution)}${monthsAtCurrent ? `, or at the current rate you will finish in about ${monthsAtCurrent} months` : ''}. Automating a transfer on payday helps.`;
    }
    return `Your ${r(goal.monthlyContribution)}/month covers the ${r(need)}/month needed. Keep it up and review progress monthly.`;
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.targetAmount && newGoal.targetDate && newGoal.category) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        targetDate: newGoal.targetDate,
        category: newGoal.category,
        monthlyContribution: Number(newGoal.monthlyContribution) || 0,
        status: 'on-track'
      };
      if (goal.targetAmount <= 0) return;
      setGoals([...goals, goal]);
      setNewGoal({ title: '', targetAmount: '', targetDate: '', category: '', monthlyContribution: '' });
      setIsAddingGoal(false);
    }
  };

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalGoalsValue > 0 ? Math.min((totalCurrentValue / totalGoalsValue) * 100, 100) : 0;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Financial Goal Tracker
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Set, track, and achieve your financial goals with AI-powered insights and recommendations
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gradient-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-electric-blue" />
              Overall Progress
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your journey towards financial freedom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">₹{totalCurrentValue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Current Savings</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">₹{totalGoalsValue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue">{overallProgress.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Add Goal Button */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-foreground">Your Goals</h3>
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button className="bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Financial Goal</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Set up a new savings or investment goal to track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-title" className="text-foreground">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Emergency Fund, Dream Car"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="border-border bg-input text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="target-amount" className="text-foreground">Target Amount (₹)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="500000"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="border-border bg-input text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="target-date" className="text-foreground">Target Date</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="border-border bg-input text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-foreground">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger className="border-border bg-input">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {goalCategories.map((category) => (
                        <SelectItem key={category} value={category} className="text-popover-foreground">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthly-contribution" className="text-foreground">Monthly Contribution (₹)</Label>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    placeholder="25000"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                    className="border-border bg-input text-foreground"
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
            const suggestion = getAdjustmentSuggestion(goal);
            const status = statusOf(goal);

            return (
              <Card key={goal.id} className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{goal.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {goal.category}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusIcon(status)}
                      <span className="ml-1">{status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium text-foreground">
                        ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">{progress.toFixed(1)}% complete</span>
                      <span className="text-xs text-muted-foreground">
                        ₹{Math.max(goal.targetAmount - goal.currentAmount, 0).toLocaleString()} remaining
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {monthsRemaining} months left
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        ₹{goal.monthlyContribution.toLocaleString()}/month
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`saved-${goal.id}`} className="text-xs text-muted-foreground">Amount saved so far (₹)</Label>
                      <Input id={`saved-${goal.id}`} type="number" min={0} value={goal.currentAmount} onChange={(e) => updateSaved(goal.id, e.target.value)} className="h-9 bg-input" />
                    </div>
                    <Button variant="outline" size="icon" aria-label={`Delete ${goal.title}`} onClick={() => removeGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-neon-teal" />
                      Smart Insight
                    </h4>
                    <p className="text-xs text-muted-foreground">{suggestion}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="bg-gradient-card border-border">
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your financial journey by setting your first goal
              </p>
              <Button 
                onClick={() => setIsAddingGoal(true)}
                className="bg-electric-blue hover:bg-electric-blue/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default FinancialGoalTracker;