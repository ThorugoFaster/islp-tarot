import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Consultations } from '@/components/Consultations';
import { Tiragens } from '@/components/Tiragens';
import { HowItWorks } from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';
import { ReviewModal } from '@/components/ReviewModal';
import { AdminPanel } from '@/components/AdminPanel';
import { LoginModal } from '@/components/LoginModal';

function App() {
  return (
    <div className="w-full max-w-[480px] mx-auto bg-bordo-300 min-h-screen overflow-x-hidden">
      <Header />

      <main>
        <Hero />
        <Consultations />
        <Tiragens />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />

      <ReviewModal />
      <LoginModal />
      <AdminPanel />
    </div>
  );
}

export default App;
