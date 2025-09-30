import { Truck, ShieldCheck, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion'; // Import motion

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const ValueProposition = () => {
  return (
    <section className="py-16 bg-blue-50"> {/* Added a light background color */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-10 text-gray-900"
        >
          Why Choose E-Store?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-blue-200">
              <CardHeader className="flex flex-col items-center pb-4">
                <Truck className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Fast & Free Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Enjoy swift delivery on all orders, with no hidden costs.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-green-200">
              <CardHeader className="flex flex-col items-center pb-4">
                <ShieldCheck className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl font-semibold">Quality Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">We stand by the quality of our products with a satisfaction guarantee.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-purple-200">
              <CardHeader className="flex flex-col items-center pb-4">
                <Headphones className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl font-semibold">24/7 Customer Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Our dedicated team is always here to assist you, day or night.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};