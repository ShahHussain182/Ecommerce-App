import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, MessageSquareText, HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { FormErrorMessage } from '@/components/FormErrorMessage';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components

// Define form schema for validation
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const ContactUs = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    console.log("Contact form submitted:", values);
    toast.success("Your message has been sent!", {
      description: "We'll get back to you shortly.",
    });
    form.reset();
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      form.setFocus(Object.keys(errors)[0] as any);
    }
  };

  const faqs = [
    {
      question: "What are your shipping options?",
      answer: "We offer standard and express shipping options. Standard shipping typically takes 5-7 business days, while express shipping delivers within 2-3 business days. Shipping costs vary based on your location and the weight of your order.",
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has shipped, you will receive an email with a tracking number and a link to track your package. You can also log into your account on our website to view your order history and tracking information.",
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns of unused and undamaged items within 30 days of purchase. Please visit our 'Shipping & Returns' page for detailed instructions on how to initiate a return.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to many international destinations. Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the recipient.",
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via the contact form on this page, by emailing us at support@e-store.com, or by calling us at +1 (555) 123-4567 during business hours.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder.svg')" }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              We're here to help! Reach out to us with any questions, feedback, or support needs.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Contact Information & Form Section */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center flex items-center justify-center gap-3">
              <MessageSquareText className="h-9 w-9 text-blue-600" /> Get in Touch
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Details</h3>
                <div className="space-y-6 text-gray-700">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-semibold">Email Us</p>
                      <p>support@e-store.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-semibold">Call Us</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Our Office</p>
                      <p>123 E-Store Avenue</p>
                      <p>Retail City, RC 10001</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="p-6 shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"> {/* Enhanced hover effect here */}
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Your Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                {...field} 
                                aria-invalid={!!error} 
                              />
                            </FormControl>
                            <FormErrorMessage message={error?.message} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Your Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                {...field} 
                                aria-invalid={!!error} 
                              />
                            </FormControl>
                            <FormErrorMessage message={error?.message} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Subject</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Regarding my recent order" 
                                {...field} 
                                aria-invalid={!!error} 
                              />
                            </FormControl>
                            <FormErrorMessage message={error?.message} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field, fieldState: { error } }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Your Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Type your message here." 
                                rows={5} 
                                {...field} 
                                aria-invalid={!!error} 
                              />
                            </FormControl>
                            <FormErrorMessage message={error?.message} />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="pt-16 md:pt-24"> {/* Added id="faq" here */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 text-center flex items-center justify-center gap-3">
              <HelpCircle className="h-9 w-9 text-green-600" /> Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;