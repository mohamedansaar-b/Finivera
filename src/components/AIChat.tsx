import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';

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

    // Simulate AI response (replace with actual OpenAI integration)
    setTimeout(() => {
      const responses = [
        "Based on your query, I'd recommend diversifying your portfolio across equity mutual funds (60%), debt funds (30%), and gold ETFs (10%). This balanced approach can help manage risk while targeting growth.",
        "For students in India, starting a SIP (Systematic Investment Plan) with as little as ₹500 per month in index funds is a great way to build wealth. Consider tax-saving ELSS funds for Section 80C benefits.",
        "Current market conditions suggest a cautious approach. Focus on quality large-cap stocks and avoid high-risk investments until market volatility decreases.",
        "For emergency funds, keep 6-12 months of expenses in liquid funds or high-yield savings accounts. This ensures easy access while earning better returns than traditional savings accounts."
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
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