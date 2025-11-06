import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { AuthLayout } from '@/components/AuthLayout';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { toast } from "sonner";
import { useAuthStore } from '@/store/authStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Spinner } from '@/components/ui/Spinner';
import GoogleSignIn from '@/components/GoogleSignIn';

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
const AUTH_API_BASE_URL =  import.meta.env.VITE_AUTH_API_BASE_URL
const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginUser, isAuthenticated } = useAuthStore();
  const clearSignupProgress = useAuthStore((state) => state.clearSignupProgress);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { clearErrors } = form;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.info("You are already logged in.");
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setServerError(null);
    try {
      const response = await axios.post(`${AUTH_API_BASE_URL}/login`, {
        emailOrUsername: values.email,
        password: values.password,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        loginUser(response.data.user);
        clearSignupProgress();
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setServerError(errorMessage);
      toast.error("Login Failed", {
        description: errorMessage,
      });
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof z.infer<typeof loginFormSchema>;
      form.setFocus(firstErrorKey);
    }
  };

  return (
    <AuthLayout
      title="Log in to your account"
      description="Welcome back! Please enter your details."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ?  (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size={18} color="text-white" />
                          <span>Logging In ...</span>
                        </div>
                      ) : "Log In"}
            </Button>
          </motion.div>
        </form>
      </Form>
      <div className="mt-6">
  <div className="text-center text-sm mb-3">Or Login with</div>
  <GoogleSignIn className="flex justify-center" onSuccessRedirect="/" />
</div>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;