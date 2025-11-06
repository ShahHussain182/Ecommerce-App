import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { AuthLayout } from '@/components/AuthLayout';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useAuthStore } from '@/store/authStore'; // Import the auth store
import { Spinner } from '@/components/ui/Spinner';
import GoogleSignIn from '@/components/GoogleSignIn';

const signupFormSchema = z.object({
  userName: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }).refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
const AUTH_API_BASE_URL =  import.meta.env.VITE_AUTH_API_BASE_URL
const SignupPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  // Use auth store state and actions
  const { isAuthenticated, isVerified, signupInProgress, signupEmail, setSignupProgress } = useAuthStore();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    mode: 'onBlur',
    defaultValues: {
      userName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { clearErrors } = form;

  // Restrict access to signup page based on auth store state
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/', { replace: true });
      toast.info("You are already logged in and verified.");
    } else if (signupInProgress && signupEmail) {
      navigate('/verify-email', { state: { email: signupEmail }, replace: true });
      toast.info("Please verify your email to continue.");
    }
  }, [navigate, isAuthenticated, isVerified, signupInProgress, signupEmail]);

  async function onSubmit(values: z.infer<typeof signupFormSchema>) {
    setServerError(null);
    const { confirmPassword, ...payload } = values;

    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/signup`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Account created successfully!", {
          description: "Please check your email to verify your account.",
        });
        setSignupProgress(payload.email); // Update auth store
        navigate('/verify-email', { state: { email: payload.email }, replace: true });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setServerError(errorMessage);
      toast.error("Signup Failed", {
        description: errorMessage,
      });
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof z.infer<typeof signupFormSchema>;
      form.setFocus(firstErrorKey);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to get started."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Signup Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <FormField
              control={form.control}
              name="userName"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourusername"
                      {...field}
                      onChange={(e) => {
                        if (error) clearErrors("userName");
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                      onChange={(e) => {
                        if (error) clearErrors("email");
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      international
                      defaultCountry="US"
                      placeholder="Enter phone number"
                      inputComponent={Input}
                      {...field}
                      onChange={(value) => {
                        if (error) clearErrors("phoneNumber");
                        field.onChange(value || "");
                      }}
                    />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        if (error) clearErrors("password");
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      onChange={(e) => {
                        if (error) clearErrors("confirmPassword");
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormErrorMessage message={error?.message} />
                </FormItem>
              )}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ?  (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size={18} color="text-white" />
                          <span>Creating Account...</span>
                        </div>
                      )  : "Create Account"}
            </Button>
          </motion.div>
        </form>
      </Form>
      <div className="mt-6">
  <div className="text-center text-sm mb-3">Or sign up with</div>
  <GoogleSignIn className="flex justify-center" onSuccessRedirect="/" />
</div>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;