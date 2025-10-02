import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sarah J.',
    title: 'Happy Customer',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah+J',
    quote: 'Absolutely love the products! The quality is superb and the customer service is outstanding. Highly recommend!',
  },
  {
    name: 'David L.',
    title: 'Satisfied Buyer',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David+L',
    quote: 'Fast shipping and exactly what I ordered. This store has become my go-to for all my needs.',
  },
  {
    name: 'Emily R.',
    title: 'Loyal Shopper',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Emily+R',
    quote: 'I\'ve been shopping here for months, and I\'m always impressed. Great variety and even better prices!',
  },
  {
    name: 'Michael B.',
    title: 'New Favorite Store',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Michael+B',
    quote: 'Found some unique items I couldn\'t find anywhere else. The checkout process was smooth and secure.',
  },
];

const testimonialVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeInOut", // Changed from "ease"
    },
  },
};

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-extrabold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          What Our Customers Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={testimonialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{testimonial.name}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}