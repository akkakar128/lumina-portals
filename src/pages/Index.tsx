import PageWrapper from '@/components/PageWrapper';
import HeroSection from '@/components/sections/HeroSection';
import SocialLinks from '@/components/SocialLinks';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const Index = () => {
  useSecretAccess();

  return (
    <PageWrapper>
      <main className="relative">
        <HeroSection />
        
        {/* Social Media Links Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-2 block">
                // Connect
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Find Me <span className="text-neon">Online</span>
              </h2>
              <p className="font-mono text-sm text-muted-foreground max-w-md mx-auto">
                Let's connect and build something amazing together
              </p>
            </div>
            
            {/* Social Links */}
            <SocialLinks 
              variant="glow" 
              iconSize="lg" 
              className="max-w-lg mx-auto"
            />
          </div>
        </section>
      </main>
      
      {/* Invisible trigger zone - triple click in bottom right corner */}
      <InvisibleTrigger />
    </PageWrapper>
  );
};

/**
 * Invisible trigger zone in the bottom-right corner.
 * Triple-click to access admin panel.
 */
const InvisibleTrigger = () => {
  const { handleSecretClick } = useSecretAccess();
  
  return (
    <div
      onClick={handleSecretClick}
      className="fixed bottom-0 right-0 w-24 h-24 cursor-default z-50"
      aria-hidden="true"
    />
  );
};

export default Index;
