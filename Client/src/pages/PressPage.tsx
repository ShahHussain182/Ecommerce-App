import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { Newspaper, Download, Mail, Phone, MessageSquareText } from 'lucide-react';
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

// Define form schema for validation
const pressContactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  organization: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const PressPage = () => {
  const form = useForm<z.infer<typeof pressContactFormSchema>>({
    resolver: zodResolver(pressContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof pressContactFormSchema>) {
    console.log("Press contact form submitted:", values);
    toast.success("Your press inquiry has been sent!", {
      description: "We'll get back to you shortly.",
    });
    form.reset();
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      form.setFocus(Object.keys(errors)[0] as any);
    }
  };

  const pressReleases = [
    {
      id: 1,
      title: "E-Store Launches New Eco-Friendly Product Line",
      date: "October 26, 2023",
      summary: "E-Store is proud to announce the launch of its new collection of sustainable and eco-friendly products, reinforcing its commitment to environmental responsibility.",
      link: "#", // Placeholder for actual press release link
    },
    {
      id: 2,
      title: "E-Store Partners with Local Artisans for Unique Collection",
      date: "September 15, 2023",
      summary: "A new collaboration brings handcrafted goods to E-Store, supporting local talent and offering customers exclusive, artisanal products.",
      link: "#", // Placeholder for actual press release link
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder.svg')" }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Press & Media
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Stay updated with the latest news, announcements, and media resources from E-Store.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Press Releases Section */}
          <section className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center flex items-center justify-center gap-3">
              <Newspaper className="h-9 w-9 text-teal-600" /> Latest Press Releases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {pressReleases.map((release) => (
                <Card key={release.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{release.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{release.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80 mb-4">{release.summary}</p>
                    <Button variant="link" asChild className="p-0 h-auto">
                      <a href={release.link} target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Media Kit Section */}
          <section className="mb-16 md:mb-24 bg-muted/50 p-8 rounded-lg shadow-inner">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center flex items-center justify-center gap-3">
              <Download className="h-9 w-9 text-cyan-600" /> Media Kit
            </h2>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="text-lg text-foreground/80">
                Access our comprehensive media kit, including high-resolution logos, brand guidelines, and product images, to assist with your coverage.
              </p>
              <Button size="lg" asChild>
                <a href="/E-Store_Media_Kit.zip" download>Download Media Kit</a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                (File size: approx. 15MB)
              </p>
            </div>
          </section>

          {/* Press Contact Section */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center flex items-center justify-center gap-3">
              <MessageSquareText className="h-9 w-9 text-purple-600" /> Press Inquiries
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div>
                <Card className="p-6 shadow-lg">
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">Email Us</h3>
                        <p className="text-foreground/80">press@e-store.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">Call Us</h3>
                        <p className="text-foreground/80">+1 (555) 987-6543</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Newspaper className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold">Our Press Office</h3>
                        <p className="text-foreground/80">E-Store Media Relations</p>
                        <p className="text-foreground/80">456 Innovation Drive</p>
                        <p className="text-foreground/80">Tech City, CA 90210</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="p-6 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Send a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                                  placeholder="Jane Doe" 
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
                                  placeholder="jane.doe@example.com" 
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
                          name="organization"
                          render={({ field, fieldState: { error } }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Organization</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Tech Daily" 
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
                                  placeholder="Interview request / Product review" 
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
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PressPage;