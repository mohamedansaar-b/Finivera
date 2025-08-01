import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, Shield } from 'lucide-react';
import tradingRoomImage from '@/assets/trading-room-hero.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${tradingRoomImage})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-electric-blue via-neon-teal to-electric-blue bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="text-foreground">Financial Guidance</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Experience the future of financial advisory with <strong>Finivera</strong>. 
            Get instant AI insights, forex predictions, and professional consultations.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 bg-card/70 backdrop-blur-sm border border-electric-blue/30 rounded-full px-6 py-3">
              <Brain className="w-5 h-5 text-electric-blue" />
              <span className="text-sm font-medium">ChatGPT Integration</span>
            </div>
            <div className="flex items-center gap-2 bg-card/70 backdrop-blur-sm border border-neon-teal/30 rounded-full px-6 py-3">
              <TrendingUp className="w-5 h-5 text-neon-teal" />
              <span className="text-sm font-medium">Forex Predictions</span>
            </div>
            <div className="flex items-center gap-2 bg-card/70 backdrop-blur-sm border border-chart-green/30 rounded-full px-6 py-3">
              <Shield className="w-5 h-5 text-chart-green" />
              <span className="text-sm font-medium">Risk Analysis</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-10 py-4"
              onClick={() => document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Free Chat
            </Button>
            <Button 
              variant="glow" 
              size="lg" 
              className="text-lg px-10 py-4"
              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Book Consultation
            </Button>
          </div>

          {/* Proprietor Credit */}
          <div className="mt-16 pt-8 border-t border-border/30">
            <p className="text-muted-foreground text-sm">
              Managed by <span className="text-electric-blue font-semibold">B. MOHAMED ANSAAR</span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-electric-blue/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-neon-teal/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-chart-green/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;