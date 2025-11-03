import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { AuthLayout } from '@/components/AuthLayout';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Spinner } from '@/components/ui/Spinner';

// Define form schema for validation
const resetPasswordFormSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&#]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: 'onBlur',
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { clearErrors } = form;

  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      // The token is passed as a URL parameter
      const response = await axios.post(`http://localhost:3001/api/v1/auth/reset-password/${token}`, {
        password: values.password,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password Reset Successful", {
          description: "Your password has been updated. You can now log in with your new password.",
        });
        // Optionally, you could automatically redirect after a few seconds
        // setTimeout(() => navigate('/login'), 5000);
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setServerError(errorMessage);
      toast.error("Reset Failed", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof z.infer<typeof resetPasswordFormSchema>;
      form.setFocus(firstErrorKey);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Successful"
        description="Your password has been successfully updated."
      >
        <div className="text-center">
          <Alert className="mb-6">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              You can now log in with your new password.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      description="Enter your new password below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Reset Failed</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ?(
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size={18} color="text-white" />
                          <span>Resetting...</span>
                        </div>
                      ) : "Reset Password"}
            </Button>
          </motion.div>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Remember your password?{" "}
        <Link to="/login" className="underline">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;