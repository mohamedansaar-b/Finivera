import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AIChat from '@/components/AIChat';
import ForexDashboard from '@/components/ForexDashboard';
import RiskMonitor from '@/components/RiskMonitor';
import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <AIChat />
      <ForexDashboard />
      <RiskMonitor />
      <BookingForm />
      <Footer />
    </div>
  );
};

export default Index;
