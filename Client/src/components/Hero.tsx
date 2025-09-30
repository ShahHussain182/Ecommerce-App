import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion'; // Import motion

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeOut" }}
        className="absolute inset-0 opacity-30 bg-cover bg-center" 
        style={{ backgroundImage: "url('/placeholder.svg')" }} // Replace with a suitable hero image
      ></motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
        >
          Discover Your Next Favorite Thing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="mt-4 max-w-2xl mx-auto text-lg text-white/90"
        >
          Shop our curated collection of high-quality products, designed to enhance your lifestyle.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="mt-8"
        >
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">Shop Now</Button>
        </motion.div>
      </div>
    </section>
  );
};