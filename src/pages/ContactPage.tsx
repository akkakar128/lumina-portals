import PageWrapper from '@/components/PageWrapper';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/layout/Footer';
import { useSecretAccess } from '@/hooks/useSecretAccess';

const ContactPage = () => {
  useSecretAccess();

  return (
    <PageWrapper>
      <div className="pt-20">
        <ContactSection />
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default ContactPage;
