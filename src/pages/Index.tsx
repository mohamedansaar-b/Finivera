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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <AIChat />
      <EnhancedForexDashboard />
      <AIMarketSummary />
      <SmartExpenseBreakdown />
      <EconomicEventCalendar />
      <FinancialGoalTracker />
      <RiskMonitor />
      <BookingForm />
      <Footer />
    </div>
  );
};

export default Index;
