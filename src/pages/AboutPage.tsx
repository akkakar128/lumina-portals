import PageWrapper from '@/components/PageWrapper';
import AboutSection from '@/components/sections/AboutSection';
import Footer from '@/components/layout/Footer';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const AboutPage = () => {
  useSecretAccess();

  return (
    <PageWrapper>
      <div className="pt-20">
        <AboutSection />
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default AboutPage;
