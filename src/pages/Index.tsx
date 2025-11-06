import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryShowcase } from '@/components/CategoryShowcase'; // New import
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { ValueProposition } from '@/components/ValueProposition'; // New import
import { Testimonials } from '@/components/Testimonials'; // New import
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import VerifyEmailBar from '@/components/VerifyEmailBar';



const Index = () => {
  const location = useLocation();

useEffect(() => {
  if (location.state?.showVerifyToast) {
    toast.error("Verify Your Email", {
      description: "Please check your email to verify your account.",
    });
    // reset state so it doesn't show again on refresh
    window.history.replaceState({}, document.title);
  }
}, [location]);
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <VerifyEmailBar />  
      <main className="flex-grow">
        <Hero />
        <CategoryShowcase /> {/* New section */}
        <FeaturedProducts />
        <ValueProposition /> {/* New section */}
        <Testimonials /> {/* New section */}
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;