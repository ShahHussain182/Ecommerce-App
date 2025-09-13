import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as z from "zod";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { FormErrorMessage } from "@/components/FormErrorMessage";
import { useAuthStore } from '@/store/authStore'; // Import the auth store


const verifyEmailSchema = z.object({
  code: z.string().min(6, { message: "Please enter the 6-digit code." }).max(6, { message: "Code must be 6 digits." }),
});

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  
  // Use auth store state and actions
  const { isAuthenticated, isVerified, signupInProgress, signupEmail, clearSignupProgress, markEmailVerified } = useAuthStore();
  const email = emailFromState || signupEmail; // Prioritize state, then store

  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  // Restrict access and manage auth store state
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/', { replace: true });
      toast.info("You are already logged in and verified.");
      return;
    }
    
    if (!signupInProgress || !email) {
      toast.error("Access Denied", {
        description: "Please sign up to verify your email.",
      });
      navigate('/signup', { replace: true });
      return;
    }
  }, [email, navigate, isAuthenticated, isVerified, signupInProgress]);

  async function onSubmit(values: z.infer<typeof verifyEmailSchema>) {
    setServerError(null);
    try {
      const response = await axios.post('http://localhost:3001/api/v1/auth/verify-email', {
        code: values.code,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Email verified successfully!", {
          description: "You can now access your account.",
        });
        markEmailVerified(); // Update auth store
        clearSignupProgress(); // Clear signup progress
        navigate('/', { replace: true }); // Redirect to home page
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during verification. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setServerError(errorMessage);
      toast.error("Verification Failed", {
        description: errorMessage,
      });
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof z.infer<typeof verifyEmailSchema>;
      form.setFocus(firstErrorKey);
    }
  };

  // If email is not present or already verified, the useEffect will handle redirection, so we don't render the form
  if (!email || (isAuthenticated && isVerified)) {
    return null; 
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      description={`We've sent a 6-digit code to ${email}. Please enter it below.`}
    >
      <div className="flex flex-col items-center justify-center">
        {serverError && (
          <Alert variant="destructive" className="mb-4 w-full">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8 w-full">
            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState: { error } }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="sr-only">Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormErrorMessage message={error?.message} className="text-center" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Verifying..." : "Verify Account"}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">Didn't receive the code?</p>
          <Button variant="link" className="p-0 h-auto">
            Resend Code
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;