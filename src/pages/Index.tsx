import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AIChat from '@/components/AIChat';
import EnhancedForexDashboard from '@/components/EnhancedForexDashboard';
import SmartExpenseBreakdown from '@/components/SmartExpenseBreakdown';
import EconomicEventCalendar from '@/components/EconomicEventCalendar';
import AIMarketSummary from '@/components/AIMarketSummary';
import FinancialGoalTracker from '@/components/FinancialGoalTracker';
import RiskMonitor from '@/components/RiskMonitor';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import { Navigate, useParams } from 'react-router-dom';

const Index = () => {
  const { threadId } = useParams<{ threadId: string }>();

  if (!threadId) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <AIChat key={threadId} threadId={threadId} />
      <div id="forex-dashboard">
        <EnhancedForexDashboard />
      </div>
      <div id="ai-market-summary">
        <AIMarketSummary />
      </div>
      <div id="expense-breakdown">
        <SmartExpenseBreakdown />
      </div>
      <div id="economic-calendar">
        <EconomicEventCalendar />
      </div>
      <div id="goal-tracker">
        <FinancialGoalTracker />
      </div>
      <div id="risk-monitor">
        <RiskMonitor />
      </div>
      <BookingForm />
      <Footer />
    </div>
  );
};

export default Index;
