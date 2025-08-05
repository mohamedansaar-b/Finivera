import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-deep-navy to-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                {/* Modern futuristic logo */}
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue via-neon-teal to-electric-blue rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                  {/* Circuit pattern background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute top-2 left-2 w-8 h-0.5 bg-gradient-to-r from-white to-transparent"></div>
                    <div className="absolute left-2 top-2 w-0.5 h-8 bg-gradient-to-b from-white to-transparent"></div>
                  </div>
                  
                  {/* Main logo element */}
                  <div className="relative">
                    <div className="w-6 h-6 border-2 border-white rounded-sm bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm">
                      <div className="absolute inset-0.5 bg-gradient-to-br from-electric-blue to-neon-teal opacity-60 rounded-xs"></div>
                      <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                      <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                
                {/* Glowing accent */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-neon-teal to-electric-blue rounded-full opacity-75 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-neon-teal/20 rounded-xl blur-lg scale-110 -z-10"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-electric-blue to-neon-teal bg-clip-text text-transparent">
                Finivera
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Your AI-powered financial assistant providing smart investment guidance, 
              forex predictions, and professional consultations for your financial success.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-electric-blue" />
              <a 
                href="mailto:bmansaar7680@gmail.com" 
                className="hover:text-electric-blue transition-colors"
              >
                bmansaar7680@gmail.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-electric-blue">Services</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/ai-advisor" className="hover:text-electric-blue transition-colors">
                  AI Financial Advisor
                </a>
              </li>
              <li>
                <a href="/forex" className="hover:text-electric-blue transition-colors">
                  Forex Predictions
                </a>
              </li>
              <li>
                <a href="/risk-monitor" className="hover:text-electric-blue transition-colors">
                  Risk Monitoring
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-electric-blue transition-colors">
                  Personal Consultations
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neon-teal">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/privacy" className="hover:text-neon-teal transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-neon-teal transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/disclaimer" className="hover:text-neon-teal transition-colors">
                  Risk Disclaimer
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-neon-teal transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex items-center space-x-6 mb-4 md:mb-0">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-electric-blue transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-electric-blue transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-electric-blue transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          <div className="text-center md:text-right text-sm text-muted-foreground">
            <p>© {currentYear} Finivera. All rights reserved.</p>
            <p className="mt-1">
              Proprietor: <span className="text-electric-blue font-semibold">B. MOHAMED ANSAAR</span>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Investment Disclaimer:</strong> All investment advice and predictions are for educational purposes only. 
            Past performance does not guarantee future results. Please consult with a qualified financial advisor 
            before making investment decisions. Finivera is not responsible for any financial losses.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;