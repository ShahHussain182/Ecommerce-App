import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { Truck, Undo, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ShippingReturnsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gray-100 py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Shipping & Returns
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
              Everything you need to know about our shipping process and how to make a return.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
          {/* Shipping Policy Section */}
          <section id="shipping">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Truck className="h-8 w-8 text-blue-600" />
                  Shipping Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-700">
                <p>We are committed to getting your order to you as quickly and efficiently as possible. All orders are processed within <strong>1-2 business days</strong> (excluding weekends and holidays) after you receive your order confirmation email.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 pt-4">Domestic Shipping Rates & Estimates</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipping Method</TableHead>
                      <TableHead>Estimated Delivery Time</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Standard Shipping</TableCell>
                      <TableCell>5-7 Business Days</TableCell>
                      <TableCell>$5.00 (Free for orders over $50)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expedited Shipping</TableCell>
                      <TableCell>2-3 Business Days</TableCell>
                      <TableCell>$15.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Overnight Shipping</TableCell>
                      <TableCell>1 Business Day</TableCell>
                      <TableCell>$30.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <h3 className="text-xl font-semibold text-gray-900 pt-4">Order Tracking</h3>
                <p>Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
              </CardContent>
            </Card>
          </section>

          {/* Returns Policy Section */}
          <section id="returns">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <Undo className="h-8 w-8 text-green-600" />
                  Return & Exchange Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-700">
                <p>We accept returns up to <strong>30 days</strong> after delivery, if the item is unused and in its original condition. We will refund the full order amount minus the shipping costs for the return.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 pt-4">How to Initiate a Return</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Visit our online return portal or reply to your order confirmation email to request a return.</li>
                  <li>Provide your order number and the reason for the return.</li>
                  <li>Once your request is approved, you will receive a return shipping label and instructions.</li>
                  <li>Pack the item securely and send it back to us.</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-900 pt-4">Refunds</h3>
                <p>Once we receive and inspect your returned item, we will process your refund. The money will be refunded to the original payment method you’ve used during the purchase. Please allow 5-7 business days for the refund to appear in your account.</p>
                
                <h3 className="text-xl font-semibold text-gray-900 pt-4">Damaged Items</h3>
                <p>In the event that your order arrives damaged in any way, please email us as soon as possible at <a href="mailto:support@e-store.com" className="text-blue-600 hover:underline">support@e-store.com</a> with your order number and a photo of the item’s condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.</p>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section id="faq">
            <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-3">
              <HelpCircle className="h-9 w-9 text-purple-600" /> Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Yes, we do! International shipping costs and delivery times will be calculated at checkout based on your location. Please be aware of any potential customs fees or duties, which are the responsibility of the customer.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I exchange an item for a different size or color?</AccordionTrigger>
                <AccordionContent>
                  The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What items are non-returnable?</AccordionTrigger>
                <AccordionContent>
                  Certain types of items cannot be returned, like perishable goods, custom products (such as special orders or personalized items), and personal care goods. We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item. Unfortunately, we cannot accept returns on sale items or gift cards.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingReturnsPage;