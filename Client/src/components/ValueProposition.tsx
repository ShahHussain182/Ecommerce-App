import { Truck, ShieldCheck, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ValueProposition = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center pb-4">
              <Truck className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-xl font-semibold">Fast & Free Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Enjoy swift delivery on all orders, with no hidden costs.</p>
            </CardContent>
          </Card>
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center pb-4">
              <ShieldCheck className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-xl font-semibold">Quality Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">We stand by the quality of our products with a satisfaction guarantee.</p>
            </CardContent>
          </Card>
          <Card className="p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center pb-4">
              <Headphones className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-xl font-semibold">24/7 Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Our dedicated team is always here to assist you, day or night.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};