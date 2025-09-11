import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Newsletter = () => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Subscribe to our Newsletter</h2>
          <p className="mt-4 text-gray-600">
            Get the latest updates on new products and upcoming sales.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4">
            <Input type="email" placeholder="Enter your email" className="flex-grow" />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </div>
    </section>
  );
};