"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import * as orderApi from '@/lib/orderApi';
import { ShippingAddress } from '@/types';
import { CreateOrderPayload } from '@/lib/orderApi';// Import CreateOrderPayload
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { Loader2, CheckCircle2, Truck, CreditCard, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Zod schema for shipping address (matches backend)
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  addressLine1: z.string().min(5, "Address Line 1 is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State/Province is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
});
const paymentMethodSchema = z.union([
  z.literal("credit_card"),
  z.literal("paypal"),
  z.literal("cash_on_delivery"),
  z.literal(""), // keep empty string in type
]);
// Zod schema for the entire checkout form
const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearRemoteCart, isLoading: isCartLoading } = useCartStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        fullName: user?.userName || '', // Pre-fill if user is logged in
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      paymentMethod: "", // Default payment method
    },
    shouldUnregister: false,
  });

  useEffect(() => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to proceed to checkout." });
      navigate('/login', { replace: true });
      return;
    }
    if (!cart || cart.items.length === 0) {
      toast.info("Your cart is empty", { description: "Please add items to your cart before checking out." });
      navigate('/cart', { replace: true });
    }
  }, [user, cart, navigate]);

  const handleNextStep = async () => {
    
    if (currentStep === 1) {
      console.log("Form values at step 1:", form.getValues());
      const isValid = await form.trigger([
        'shippingAddress.fullName',
        'shippingAddress.addressLine1',
        'shippingAddress.city',
        'shippingAddress.state',
        'shippingAddress.postalCode',
        'shippingAddress.country'
      ]);
      if (isValid) {
        setCurrentStep(2);
      } else {
        toast.error("Validation Error", { description: "Please correct the shipping address details." });
      }
    } else if (currentStep === 2) {
      const isValid = await form.trigger('paymentMethod');
      if (isValid) {
        setCurrentStep(3);
      } else {
        toast.error("Validation Error", { description: "Please select a payment method." });
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    console.log("Attempting to submit order with values:", values); // Log when onSubmit is called
    setIsPlacingOrder(true);
    try {
      // Explicitly cast values to CreateOrderPayload after Zod validation
      const newOrder = await orderApi.createOrder(values as CreateOrderPayload);
      await clearRemoteCart(); // Clear cart after successful order
      toast.success("Order Placed!", {
        description: `Your order #${newOrder._id.substring(0, 8)} has been placed successfully.`,
      });
      navigate(`/order-confirmation/${newOrder._id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to place order. Please try again.";
      toast.error("Order Failed", { description: errorMessage });
      console.error("Checkout error:", error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors); // Log validation errors
    toast.error("Please correct the form errors.", {
      description: "Some required fields are missing or invalid.",
    });
  };

  if (isCartLoading || !cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-4 text-lg text-gray-700">Loading cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="space-y-6"  key="step1">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping Address</h3>
            <FormField
              control={form.control}
              name="shippingAddress.fullName"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormErrorMessage message={error?.message} />
                  
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingAddress.addressLine1"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingAddress.addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl><Input placeholder="Apartment, suite, etc." {...field} /></FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingAddress.city"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="New York" {...field} /></FormControl>
                    <FormErrorMessage message={error?.message} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.state"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl><Input placeholder="NY" {...field} /></FormControl>
                    <FormErrorMessage message={error?.message} />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingAddress.postalCode"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl><Input placeholder="10001" {...field} /></FormControl>
                    <FormErrorMessage message={error?.message} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.country"
                render={({ field, fieldState: { error } }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input placeholder="USA" {...field} /></FormControl>
                    <FormErrorMessage message={error?.message} />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        );
      case 2:
        return (
          <CardContent className="space-y-6"  key="step2">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Method</h3>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                        <FormControl>
                          <RadioGroupItem value="credit_card" />
                        </FormControl>
                        <FormLabel className="font-normal flex-grow">
                          Credit Card (Mock Payment)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                        <FormControl>
                          <RadioGroupItem value="paypal" />
                        </FormControl>
                        <FormLabel className="font-normal flex-grow">
                          PayPal (Mock Payment)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md">
                        <FormControl>
                          <RadioGroupItem value="cash_on_delivery" />
                        </FormControl>
                        <FormLabel className="font-normal flex-grow">
                          Cash on Delivery
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-gray-500 mt-4">
              Note: This is a mock payment integration. No real transactions will occur.
            </p>
          </CardContent>
        );
      case 3:
        const shippingData = form.getValues('shippingAddress');
        const paymentData = form.getValues('paymentMethod');
        return (
          <CardContent className="space-y-6"  key="step3">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Review Your Order</h3>

            {/* Shipping Details */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-2">Shipping To:</CardTitle>
              <p>{shippingData.fullName}</p>
              <p>{shippingData.addressLine1}</p>
              {shippingData.addressLine2 && <p>{shippingData.addressLine2}</p>}
              <p>{shippingData.city}, {shippingData.state} {shippingData.postalCode}</p>
              <p>{shippingData.country}</p>
            </Card>

            {/* Payment Details */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-2">Payment Method:</CardTitle>
              <p className="capitalize">{paymentData.replace(/_/g, ' ')}</p>
            </Card>

            {/* Order Items Summary */}
            <Card className="p-4">
              <CardTitle className="text-lg mb-2">Items:</CardTitle>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <img src={item.imageAtTime} alt={item.nameAtTime} className="w-10 h-10 object-cover rounded-md" />
                      <span>{item.nameAtTime} ({item.sizeAtTime} / {item.colorAtTime}) x {item.quantity}</span>
                    </div>
                    <span>${(item.priceAtTime * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Shipping</span>
                <span>$0.00</span> {/* For now, assuming free shipping */}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Order Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
            </Card>
          </CardContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Indicator */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <CardTitle className="mb-4">Progress</CardTitle>
              <ul className="space-y-4">
                <li className={cn("flex items-center gap-3", currentStep >= 1 ? "text-primary" : "text-gray-500")}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-gray-200")}>
                    {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : 1}
                  </div>
                  <span className="font-medium">Shipping Address</span>
                </li>
                <li className={cn("flex items-center gap-3", currentStep >= 2 ? "text-primary" : "text-gray-500")}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-gray-200")}>
                    {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : 2}
                  </div>
                  <span className="font-medium">Payment Method</span>
                </li>
                <li className={cn("flex items-center gap-3", currentStep >= 3 ? "text-primary" : "text-gray-500")}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200">
                    {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : 3}
                  </div>
                  <span className="font-medium">Review & Place Order</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Checkout Form / Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Enter Shipping Address"}
                  {currentStep === 2 && "Select Payment Method"}
                  {currentStep === 3 && "Confirm Your Order"}
                </CardTitle>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                  {renderStepContent()}
                  <CardFooter className="flex justify-between mt-6">
                    {currentStep > 1 && (
                      <Button  type="button" variant="outline" onClick={handlePreviousStep} disabled={isPlacingOrder}>
                        Back
                      </Button>
                    )}
                    {currentStep < 3 && (
                      <Button  type="button" onClick={handleNextStep} className="ml-auto" disabled={isPlacingOrder}>
                        Next
                      </Button>
                    )}
                    {currentStep === 3 && (
                      <Button type="submit" className="ml-auto" disabled={isPlacingOrder}>
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <Package className="mr-2 h-4 w-4" />
                            Place Order
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;