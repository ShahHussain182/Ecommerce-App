import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryShowcase } from '@/components/CategoryShowcase'; // New import
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { ValueProposition } from '@/components/ValueProposition'; // New import
import { Testimonials } from '@/components/Testimonials'; // New import
import { Newsletter } from '@/components/Newsletter';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
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