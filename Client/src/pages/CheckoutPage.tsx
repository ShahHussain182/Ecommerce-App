import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { orderApi } from '@/lib/orderApi';
import { cartApi } from '@/lib/cartApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateCartTotals } from '@/utils/cartUtils';
import { ProductImage } from '@/components/ProductImage';

const CheckoutFormSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  paymentMethod: z.enum(["credit_card", "paypal", "cash_on_delivery"], {
    required_error: "Please select a payment method.",
  }),
});

type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, clearCart: clearLocalCart, fetchCart: fetchLocalCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subtotal, shippingCost, tax, total } = calculateCartTotals(cart);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      shippingAddress: {
        fullName: user?.userName || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      paymentMethod: 'credit_card',
    },
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to proceed with checkout.");
      navigate('/login');
    }
    if (cart.items.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      navigate('/cart');
    }
    fetchLocalCart(); // Ensure cart is up-to-date
  }, [user, cart.items.length, navigate, fetchLocalCart]);

  const clearRemoteCart = async () => {
    try {
      await cartApi.clearCart();
      clearLocalCart();
    } catch (err) {
      console.error("Failed to clear remote cart:", err);
      toast.error("Failed to clear cart after order. Please clear it manually.");
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newOrder = await orderApi.createOrder(values);
      await clearRemoteCart(); // Clear cart after successful order
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${newOrder.orderNumber}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || cart.items.length === 0) {
    return null; // Or a loading spinner/message
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 md:py-12 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]"
    >
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">Checkout</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Address & Payment Method */}
        <Card className="lg:col-span-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
              <Truck className="h-6 w-6" /> Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apt, Suite, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-8 dark:bg-gray-700" />

                <CardTitle className="text-2xl flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                  <CreditCard className="h-6 w-6" /> Payment Method
                </CardTitle>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="sr-only">Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md dark:border-gray-600 dark:bg-gray-700">
                            <FormControl>
                              <RadioGroupItem value="credit_card" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-800 dark:text-gray-200">
                              Credit Card
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md dark:border-gray-600 dark:bg-gray-700">
                            <FormControl>
                              <RadioGroupItem value="paypal" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-800 dark:text-gray-200">
                              PayPal
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md dark:border-gray-600 dark:bg-gray-700">
                            <FormControl>
                              <RadioGroupItem value="cash_on_delivery" />
                            </FormControl>
                            <FormLabel className="font-normal text-gray-800 dark:text-gray-200">
                              Cash on Delivery
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full py-3 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="mr-2 h-5 w-5" /> Place Order
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
              <ShoppingCart className="h-6 w-6" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {cart.items.map((item) => (
                <div key={item.productId + item.variantId} className="flex items-center gap-4 py-2 border-b last:border-b-0 dark:border-gray-700">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </ScrollArea>

            <Separator className="dark:bg-gray-700" />

            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (estimated):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="dark:bg-gray-700" />
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Order Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}