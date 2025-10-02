import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion'; // Import motion

export const Newsletter = () => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 py-16 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold">Subscribe to Our Newsletter</h2>
          <p className="mt-4 text-lg text-white/90">
            Get the latest updates on new products, exclusive offers, and upcoming sales directly to your inbox.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-grow bg-white/90 text-gray-900 placeholder:text-gray-500 border-none focus:ring-2 focus:ring-white dark:bg-gray-700/90 dark:text-gray-50 dark:placeholder:text-gray-400" 
            />
            <Button type="submit" className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 shadow-md hover:shadow-lg transition-all duration-300">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};