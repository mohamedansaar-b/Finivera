import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'AI Advisor', href: '/ai-advisor' },
    { name: 'Forex Prediction', href: '/forex' },
    { name: 'Market Summary', href: '/market-summary' },
    { name: 'Expense Tracker', href: '/expense-tracker' },
    { name: 'Economic Calendar', href: '/economic-calendar' },
    { name: 'Goal Tracker', href: '/goal-tracker' },
    { name: 'Risk Monitor', href: '/risk-monitor' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-electric-blue via-neon-teal to-chart-green rounded-xl flex items-center justify-center shadow-lg shadow-electric-blue/30 border border-electric-blue/20">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-electric-blue to-neon-teal rounded-sm"></div>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-neon-teal bg-clip-text text-transparent">
              Finivera
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center overflow-x-auto scrollbar-hide">
            <div className="flex items-center space-x-4 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.href === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (item.href === '/ai-advisor') {
                      document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/forex') {
                      document.getElementById('forex-dashboard')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/market-summary') {
                      document.getElementById('ai-market-summary')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/expense-tracker') {
                      document.getElementById('expense-breakdown')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/economic-calendar') {
                      document.getElementById('economic-calendar')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/goal-tracker') {
                      document.getElementById('goal-tracker')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/risk-monitor') {
                      document.getElementById('risk-monitor')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/contact') {
                      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-foreground hover:text-electric-blue transition-colors whitespace-nowrap text-sm"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              variant="hero" 
              size="sm"
              onClick={() => document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Chat
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border">
              <div className="flex flex-col space-y-3 pt-4 max-h-96 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (item.href === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (item.href === '/ai-advisor') {
                      document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/forex') {
                      document.getElementById('forex-dashboard')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/market-summary') {
                      document.getElementById('ai-market-summary')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/expense-tracker') {
                      document.getElementById('expense-breakdown')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/economic-calendar') {
                      document.getElementById('economic-calendar')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/goal-tracker') {
                      document.getElementById('goal-tracker')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/risk-monitor') {
                      document.getElementById('risk-monitor')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.href === '/contact') {
                      document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-foreground hover:text-electric-blue transition-colors text-left text-sm py-2"
                >
                  {item.name}
                </button>
              ))}
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start Free Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;