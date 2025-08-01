import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookingFormData {
  name: string;
  email: string;
  date: string;
  time: string;
  message: string;
}

const BookingForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission (replace with actual email service integration)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with EmailJS, Resend, or similar service
      // Example: await sendEmail(formData);
      
      toast({
        title: "Appointment Booked!",
        description: "Your consultation has been scheduled. You'll receive a confirmation email shortly.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        date: '',
        time: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error scheduling your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <section id="booking-form" className="py-20 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-electric-blue to-neon-teal bg-clip-text text-transparent">
                Book Your Consultation
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Schedule a face-to-face consultation with our financial expert
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card className="bg-card/50 backdrop-blur-sm border border-electric-blue/20 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-electric-blue" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-background border-electric-blue/30 focus:border-electric-blue"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-electric-blue" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-background border-electric-blue/30 focus:border-electric-blue"
                    required
                  />
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-electric-blue" />
                    Preferred Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-background border-electric-blue/30 focus:border-electric-blue"
                    required
                  />
                </div>

                {/* Time Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-electric-blue" />
                    Preferred Time *
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={formData.time === time ? "hero" : "glow"}
                        size="sm"
                        onClick={() => handleInputChange('time', time)}
                        className="w-full"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-electric-blue" />
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your financial goals or specific areas you'd like to discuss..."
                    className="bg-background border-electric-blue/30 focus:border-electric-blue min-h-[100px]"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Booking...' : 'Schedule Consultation'}
                </Button>
              </form>
            </Card>

            {/* Consultation Info */}
            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border border-neon-teal/20 p-6">
                <h3 className="text-2xl font-bold mb-4 text-neon-teal">What to Expect</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-teal rounded-full mt-2"></div>
                    <span>Personalized financial analysis based on your goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-teal rounded-full mt-2"></div>
                    <span>Investment strategy recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-teal rounded-full mt-2"></div>
                    <span>Risk assessment and portfolio optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-neon-teal rounded-full mt-2"></div>
                    <span>Tax planning and wealth management advice</span>
                  </li>
                </ul>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-chart-green/20 p-6">
                <h3 className="text-2xl font-bold mb-4 text-chart-green">Consultation Details</h3>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-foreground font-semibold">60 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="text-foreground font-semibold">Face-to-face</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Follow-up:</span>
                    <span className="text-foreground font-semibold">Email summary</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultant:</span>
                    <span className="text-foreground font-semibold">B. Mohamed Ansaar</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border border-warning-orange/20 p-6">
                <h3 className="text-2xl font-bold mb-4 text-warning-orange">Preparation Tips</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Bring your current investment statements</li>
                  <li>• List your financial goals and timeline</li>
                  <li>• Prepare questions about specific investments</li>
                  <li>• Consider your risk tolerance preferences</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;