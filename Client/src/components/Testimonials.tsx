import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion'; // Import motion

const testimonials = [
  {
    name: "Sarah J.",
    quote: "E-Store has completely transformed my online shopping experience. The quality of products is unmatched, and their customer service is exceptional!",
    rating: 5,
  },
  {
    name: "Mark T.",
    quote: "I'm always impressed with the unique selection and fast shipping. E-Store is my go-to for all my needs.",
    rating: 5,
  },
  {
    name: "Emily R.",
    quote: "Finding exactly what I need is so easy, and the product descriptions are always accurate. Highly recommend!",
    rating: 4,
  },
];

const testimonialVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-10"
        >
          What Our Customers Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <CardHeader className="pb-4 flex-grow">
                  <div className="flex items-center justify-center mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gray-300" />
                    ))}
                  </div>
                  <p className="text-lg font-medium text-center italic text-gray-800">"{testimonial.quote}"</p>
                </CardHeader>
                <CardContent className="text-center text-gray-700 font-semibold mt-auto">
                  - {testimonial.name}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};