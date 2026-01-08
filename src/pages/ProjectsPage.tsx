import PageWrapper from '@/components/PageWrapper';
import ProjectsSection from '@/components/sections/ProjectsSection';
import Footer from '@/components/layout/Footer';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const ProjectsPage = () => {
  useSecretAccess();

  return (
    <PageWrapper>
      <div className="pt-20">
        <ProjectsSection />
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default ProjectsPage;
