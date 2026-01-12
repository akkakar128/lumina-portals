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
