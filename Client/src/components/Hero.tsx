import { Button } from '@/components/ui/button';

export const Hero = () => {
  return (
    <section className="bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Discover Your Next Favorite Thing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Shop our curated collection of high-quality products, designed to enhance your lifestyle.
          </p>
          <div className="mt-8">
            <Button size="lg">Shop Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
};