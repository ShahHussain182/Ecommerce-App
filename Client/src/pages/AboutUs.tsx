import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Lightbulb, Handshake, Heart, Rocket, Users } from 'lucide-react'; // Added Rocket and Users icons
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar component

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Jane Doe",
      title: "CEO & Founder",
      image: "/placeholder.svg", // Placeholder image
      description: "Jane envisioned E-Store as a platform for quality and customer-centric shopping.",
    },
    {
      name: "John Smith",
      title: "Chief Technology Officer",
      image: "/placeholder.svg", // Placeholder image
      description: "John leads our tech team, ensuring a seamless and secure online experience.",
    },
    {
      name: "Emily White",
      title: "Head of Product",
      image: "/placeholder.svg", // Placeholder image
      description: "Emily curates our product selection, focusing on innovation and customer needs.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder.svg')" }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              About E-Store
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">
              Your trusted partner for quality products and exceptional service.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Founded in 2023, E-Store began with a simple vision: to create an online shopping experience that combines convenience, quality, and customer satisfaction. We noticed a gap in the market for a platform that truly prioritizes the customer, offering a curated selection of products that meet high standards of excellence.
              </p>
              <p className="mt-4 text-lg text-foreground/80 leading-relaxed">
                From humble beginnings, we've grown into a thriving community of shoppers and innovators. Every product in our catalog is hand-picked, and every customer interaction is an opportunity to build lasting relationships. We believe in transparency, integrity, and continuously striving to exceed expectations.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission & Vision Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Our Mission & Vision</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center pb-4">
                  <Rocket className="h-12 w-12 text-purple-600 mb-4" />
                  <CardTitle className="text-xl font-semibold">Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    To empower individuals to discover and acquire high-quality products that enhance their daily lives, delivered with unparalleled convenience and exceptional customer care.
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center pb-4">
                  <Lightbulb className="h-12 w-12 text-yellow-600 mb-4" />
                  <CardTitle className="text-xl font-semibold">Our Vision</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    To be the leading online destination for curated products, recognized for our commitment to quality, innovation, and fostering a trusted community of shoppers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center pb-4">
                  <Lightbulb className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl font-semibold">Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We constantly seek new ways to improve our products and services, embracing creativity and forward-thinking solutions.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center pb-4">
                  <Handshake className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle className="text-xl font-semibold">Integrity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We operate with honesty and transparency, building trust with our customers and partners in every interaction.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-col items-center pb-4">
                  <Heart className="h-12 w-12 text-red-600 mb-4" />
                  <CardTitle className="text-xl font-semibold">Customer Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our customers are at the heart of everything we do. We are dedicated to providing exceptional service and satisfaction.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Meet Our Team Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-col items-center pb-4">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl font-semibold">{member.name}</CardTitle>
                    <p className="text-sm text-blue-600 font-medium">{member.title}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-blue-600 text-white text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Explore?</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Join the E-Store family and discover a world of quality products and unparalleled service.
            </p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700">
              <Link to="/">Shop Our Products</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;