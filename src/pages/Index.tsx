import Navigation from '@/components/layout/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const Index = () => {
  // Initialize secret access listeners (Konami code works globally)
  useSecretAccess();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
      
      {/* Invisible trigger zone - triple click in bottom right corner */}
      <InvisibleTrigger />
    </div>
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
