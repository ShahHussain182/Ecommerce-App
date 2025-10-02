"use client";

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormErrorMessage } from '@/components/FormErrorMessage';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lock, KeyRound, ArrowLeft, Loader2, Save } from 'lucide-react'; // Added Save icon

import { useAuthStore } from '@/store/authStore';
import * as authApi from '@/lib/authApi';
import {changePasswordSchema } from "../../Schemas/authSchema.js" // Import backend schema

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const { clearErrors } = form;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to change your password." });
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null);
    try {
      const response = await authApi.changePassword(values);

      if (response.success) {
        toast.success("Password Updated", {
          description: response.message,
        });
        form.reset(); // Clear form fields
        navigate('/profile'); // Go back to profile page
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.error("Password Change Failed", {
        description: errorMessage,
      });
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof ChangePasswordFormValues;
      form.setFocus(firstErrorKey);
    }
  };

  if (!user) {
    return null; // Render nothing if user is not loaded/authenticated, useEffect will redirect
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Lock className="h-8 w-8 text-primary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Update Failed</AlertTitle>
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            onChange={(e) => {
                              if (error) clearErrors("currentPassword");
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormErrorMessage message={error?.message} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Lock className="h-4 w-4" /> New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            onChange={(e) => {
                              if (error) clearErrors("newPassword");
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormErrorMessage message={error?.message} />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/profile')} className="flex-grow">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                    <Button type="submit" className="flex-grow" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChangePasswordPage;