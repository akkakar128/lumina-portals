import PageWrapper from '@/components/PageWrapper';
import SkillsSection from '@/components/sections/SkillsSection';
import Footer from '@/components/layout/Footer';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const SkillsPage = () => {
  useSecretAccess();

  return (
    <PageWrapper>
      <div className="pt-20">
        <SkillsSection />
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default SkillsPage;
