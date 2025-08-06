import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI Financial Advisor. I can help you with investment strategies, savings plans, market insights, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFinancialAdviceResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Specific prompts from homepage
    if (lowerMessage.includes('invest ₹10,000') || lowerMessage.includes('invest 10,000')) {
      return "For ₹10,000, consider these options: 1) Start a SIP in diversified equity mutual funds (₹5,000) for long-term growth, 2) Put ₹3,000 in a liquid fund for emergency access, 3) Invest ₹2,000 in ELSS funds for tax savings. This balanced approach provides growth potential while maintaining some liquidity.";
    }
    
    if (lowerMessage.includes('savings plan') && lowerMessage.includes('student')) {
      return "For Indian students, I recommend: 1) Open a zero-balance savings account with good digital banking features, 2) Start a recurring deposit of ₹500-1000 monthly, 3) Use student-friendly apps like CRED or Jupiter for expense tracking, 4) Consider a small SIP in large-cap mutual funds (₹500/month) to learn about investments early.";
    }
    
    if (lowerMessage.includes('sip') && lowerMessage.includes('explain')) {
      return "SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly in mutual funds, typically monthly. Benefits: 1) Rupee cost averaging - you buy more units when prices are low, 2) Disciplined investing habit, 3) Power of compounding over time, 4) No need to time the market. Start with as little as ₹500/month in diversified equity funds for long-term wealth creation.";
    }
    
    if (lowerMessage.includes('market outlook') || lowerMessage.includes('current market')) {
      return "The Indian markets are influenced by global factors, domestic policies, and economic indicators. Key trends: 1) IT sector facing challenges due to global slowdown, 2) Banking and financial services showing resilience, 3) Infrastructure and renewable energy sectors have long-term potential. For individual investors, focus on long-term SIPs rather than market timing.";
    }
    
    // General financial advice based on keywords
    if (lowerMessage.includes('saving') || lowerMessage.includes('save money')) {
      return "Start by tracking your income and expenses to understand your spending habits. Set a monthly savings goal—ideally 20% of your income—and automate transfers to a savings account. Also, reduce unnecessary expenses and prioritize needs over wants.";
    }
    
    if (lowerMessage.includes('mutual fund') || lowerMessage.includes('fixed deposit')) {
      return "It depends on your financial goals and risk tolerance. Fixed deposits offer guaranteed returns with low risk, while mutual funds have higher potential returns but come with market risk. If you're investing for the long term and can tolerate some risk, mutual funds may be suitable.";
    }
    
    if (lowerMessage.includes('emergency fund')) {
      return "An ideal emergency fund should cover 3 to 6 months of your essential expenses—like rent, groceries, and utility bills. This ensures you're financially prepared for unexpected situations like job loss or medical emergencies.";
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
      return "First, list your monthly income sources. Then categorize your expenses into essentials (rent, food, bills), savings, and discretionary (shopping, entertainment). Use the 50/30/20 rule as a guideline: 50% on needs, 30% on wants, and 20% on savings.";
    }
    
    if (lowerMessage.includes('retirement') || lowerMessage.includes('retire')) {
      return "The best time to start is now! The earlier you begin, the more you benefit from compounding. Even small amounts saved early can grow significantly over time. Use tools like SIPs, PPF, or NPS to build your retirement corpus.";
    }
    
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return "First, list all your debts and interest rates. Focus on clearing high-interest debt first while paying minimums on others. Consider the snowball or avalanche method. Avoid new debt, cut back on expenses, and increase your income if possible.";
    }
    
    if (lowerMessage.includes('credit score')) {
      return "Your credit score reflects your creditworthiness. Lenders use it to decide loan approvals and interest rates. A higher score (above 750) improves your chances of getting loans with better terms. You can maintain a good score by paying EMIs on time and using credit wisely.";
    }
    
    if (lowerMessage.includes('financial plan') || lowerMessage.includes('planning')) {
      return "Start by identifying your goals—like buying a house, retirement, or children's education. Assign a timeline and estimate the cost for each. Then, calculate how much to save or invest monthly and choose the right investment instruments based on your risk profile and horizon.";
    }
    
    // Default response for other financial queries
    return "Thank you for your financial question! As your AI advisor, I'm here to help with investments, savings, budgeting, and financial planning. For personalized advice, please share more details about your financial goals, income, and current situation. I can help you create a customized financial roadmap.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: inputMessage }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Fallback to predefined financial advice
      const fallbackResponse = getFinancialAdviceResponse(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-chat" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-electric-blue to-neon-teal bg-clip-text text-transparent">
                AI Financial Advisor
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Get instant, personalized financial advice powered by advanced AI
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 shadow-[var(--shadow-elevated)]">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-electric-blue' 
                        : 'bg-gradient-to-r from-neon-teal to-electric-blue'
                    }`}>
                      {message.type === 'user' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <Bot className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-electric-blue text-white'
                        : 'bg-muted border border-border'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-teal to-electric-blue flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted border border-border rounded-lg p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about investments, savings, market trends..."
                  className="flex-1 bg-background border-electric-blue/30 focus:border-electric-blue"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  variant="hero"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Prompts */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "How can I invest ₹10,000?",
              "Best savings plan for Indian students?",
              "Explain SIP investments",
              "Current market outlook?"
            ].map((prompt, index) => (
              <Button
                key={index}
                variant="glow"
                className="justify-start h-auto p-4 text-left"
                onClick={() => setInputMessage(prompt)}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChat;