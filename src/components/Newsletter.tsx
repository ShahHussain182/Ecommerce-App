import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion'; // Import motion
import { useState } from 'react';
import * as userApi from '@/lib/userApi';
import { toast } from "sonner";
export const Newsletter = () => {


  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const isValidEmail = (value: string) => {
    try {
      userApi.NewsLetterPayloadSchema.parse({ email: value.trim() });
      return true;
    } catch {
      return false;
    }
  };
 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const normalized = email.trim();
    if (!isValidEmail(normalized)) {
      setStatus('error');
      toast.error('Invalid email', { description: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await userApi.submitEmailForNewsletter({ email });

      if (response.success) {
        setStatus("success");
        setEmail('');
        toast.success("Thanks — check your inbox for updates!", {
          description: "Your Email has been successfully subscribed to our newsletter.",
        });
      
      }
      else {
        setStatus("error");
        toast.error("Subscription failed", { description: response.message || 'Please try again.' });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatus("error");
      toast.error("Request Failed", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 py-16 text-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}
                  className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Subscribe to Our Newsletter</h2>
        <p className="mt-4 text-lg text-white/90">
          Get the latest updates on new products, exclusive offers, and upcoming sales directly to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-grow bg-white/90 text-gray-900 placeholder:text-gray-500 border-none focus:ring-2 focus:ring-white"
            required
          />
          <Button
            type="submit"
            disabled={loading || !isValidEmail(email)}
            className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>

        {status === 'success' && <p className="mt-4 text-green-200">Thanks — check your inbox for updates!</p>}
        {status === 'error' && <p className="mt-4 text-red-200">Something went wrong. Try again later.</p>}
      </motion.div>
    </div>
  </section>
  );
};