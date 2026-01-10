import { useState } from 'react';
import { Mail, MapPin, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AnimatedTitle from '../AnimatedTitle';

const ContactSection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation({ threshold: 0.2, delay: 150 });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. I'll get back to you soon.",
    });
    
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with 3D animated title */}
        <div 
          ref={headerRef}
          className={`text-center mb-16 ${headerVisible ? 'scroll-parallax-float' : 'scroll-hidden'}`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 block">
            // Contact
          </span>
          <div className="mb-6">
            <AnimatedTitle 
              text="LET'S CONNECT" 
              as="h2"
              className="text-4xl md:text-5xl lg:text-6xl"
            />
          </div>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or just want to chat? I'm always open to new opportunities and collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact info with fade-left animation */}
          <div 
            ref={infoRef}
            className={infoVisible ? 'scroll-fade-left' : 'scroll-hidden'}
          >
            <div className="glass-card p-8 h-full">
              <h3 className="font-display text-2xl font-bold mb-8 text-foreground">
                Get in Touch
              </h3>

              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="font-mono text-foreground group-hover:text-primary transition-colors">hello@portfolio.dev</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="font-mono text-foreground group-hover:text-primary transition-colors">Worldwide / Remote</p>
                  </div>
                </div>
              </div>

              {/* Social links with staggered hover effects */}
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
                  Follow Me
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="p-3 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                      style={{ transitionDelay: `${index * 50}ms` }}
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Decorative element */}
              <div className="mt-8 pt-8 border-t border-border/30">
                <p className="font-mono text-sm text-muted-foreground">
                  <span className="text-primary animate-pulse">{'>'}</span> Currently available for freelance projects
                </p>
              </div>
            </div>
          </div>

          {/* Contact form with fade-right animation */}
          <div 
            ref={formRef}
            className={formVisible ? 'scroll-fade-right' : 'scroll-hidden'}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8">
              <h3 className="font-display text-2xl font-bold mb-8 text-foreground">
                Send a Message
              </h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-input border border-border/50 rounded-lg font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div className="group">
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-input border border-border/50 rounded-lg font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="group">
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-input border border-border/50 rounded-lg font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01] transition-all resize-none duration-300"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cyber-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
