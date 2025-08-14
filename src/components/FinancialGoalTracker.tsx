import { useState } from 'react';
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
  PiggyBank
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

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 500000,
    currentAmount: 325000,
    targetDate: '2024-12-31',
    category: 'Emergency',
    monthlyContribution: 25000,
    status: 'on-track'
  },
  {
    id: '2',
    title: 'Home Down Payment',
    targetAmount: 2000000,
    currentAmount: 800000,
    targetDate: '2025-06-30',
    category: 'Property',
    monthlyContribution: 50000,
    status: 'behind'
  },
  {
    id: '3',
    title: 'Vacation Fund',
    targetAmount: 150000,
    currentAmount: 120000,
    targetDate: '2024-05-15',
    category: 'Lifestyle',
    monthlyContribution: 10000,
    status: 'ahead'
  }
];

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
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
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

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(diffMonths, 0);
  };

  const getAdjustmentSuggestion = (goal: Goal) => {
    const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
    const requiredMonthly = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
    
    if (goal.monthlyContribution < requiredMonthly) {
      const increase = requiredMonthly - goal.monthlyContribution;
      return `Increase monthly contribution by ₹${increase.toLocaleString()} to stay on track`;
    } else if (progress > 80) {
      return 'You\'re doing great! Consider maintaining current contributions';
    }
    return 'Continue with current plan';
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
      setGoals([...goals, goal]);
      setNewGoal({ title: '', targetAmount: '', targetDate: '', category: '', monthlyContribution: '' });
      setIsAddingGoal(false);
    }
  };

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentValue / totalGoalsValue) * 100;

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
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusIcon(goal.status)}
                      <span className="ml-1">{goal.status.replace('-', ' ')}</span>
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
                        ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
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

                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-neon-teal" />
                      AI Recommendation
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