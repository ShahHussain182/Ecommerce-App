"use client";

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
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
import { Terminal, User, Mail, Phone, Save, ArrowLeft } from 'lucide-react'; // removed Loader2
import { Spinner } from '@/components/ui/Spinner'; // <-- added

import { useAuthStore } from '@/store/authStore';
import * as authApi from '@/lib/authApi';

// Define form schema for validation, matching the backend's updateUserSchema
const editProfileFormSchema = z.object({
  userName: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be at most 20 characters long" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }).refine(isValidPhoneNumber, { message: "Invalid phone number" }).optional(),
}).partial(); // Allow partial updates

type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout,setSignupProgress } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    mode: 'onBlur',
    defaultValues: {
      userName: user?.userName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const { clearErrors, reset } = form;

  // Pre-fill form with current user data
  useEffect(() => {
    if (user) {
      reset({
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, reset]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error("Authentication Required", { description: "Please log in to edit your profile." });
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  async function onSubmit(values: EditProfileFormValues) {
    setServerError(null);
    try {
      const response = await authApi.updateUserProfile(values);

      if (response.success && response.user) {
        updateUser(response.user);
        toast.success("Profile Updated", {
          description: response.message,
        });
        if (!response.user.isVerified) {
          toast.info("Email changed. Please verify your new email.", {
            description: "A new verification code has been sent.",
          });
          setSignupProgress(response.user.email);
          
           navigate('/verify-email', { state: { email: response.user.email }, replace: true });
        }
        
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.error("Profile Update Failed", {
        description: errorMessage,
      });
    }
  }

  const onError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0] as keyof EditProfileFormValues;
      form.setFocus(firstErrorKey);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <User className="h-8 w-8 text-primary" /> Edit Profile
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
                    name="userName"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="yourusername"
                            {...field}
                            onChange={(e) => {
                              if (error) clearErrors("userName");
                              field.onChange(e);
                            }}
                            disabled={form.formState.isSubmitting}
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
      <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</FormLabel>
      <FormControl>
        <Input
          type="email"
          placeholder="name@example.com"
          {...field}
          onChange={(e) => {
            if (error) clearErrors("email");
            field.onChange(e);
          }}
          disabled={form.formState.isSubmitting || !!user?.googleId} // disable for google users
        />
      </FormControl>
      <FormErrorMessage message={error?.message} />
      {user?.googleId && (
        <p className="text-sm text-muted-foreground mt-2">
          This account is linked with Google — email is managed by Google.{" "}
          <button
            type="button"
            onClick={() => navigate('/profile/link-local')}
            className="underline ml-1"
          >
            Add a password to change email
          </button>
        </p>
      )}
    </FormItem>
  )}
/>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</FormLabel>
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
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormErrorMessage message={error?.message} />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/profile')} className="flex-grow" disabled={form.formState.isSubmitting}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
                    </Button>
                    <Button type="submit" className="flex-grow" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size={18} color="text-white" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Save Changes
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

export default EditProfilePage;