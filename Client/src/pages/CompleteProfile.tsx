import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {AuthLayout} from "@/components/AuthLayout";
import { useQueryClient } from '@tanstack/react-query';


const schema = z.object({
  phoneNumber: z.string().min(1).refine(isValidPhoneNumber, { message: "Invalid phone number" }),
});

type FormData = z.infer<typeof schema>;
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, setAuthenticatedUser,isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
    },
  });
  useEffect(() => {
    // If user is present and already has phoneNumber, send them home
    if (user && user.phoneNumber) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => {
    // If user is present and already has phoneNumber, send them home
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  async function onSubmit(values: FormData) {
    try {
      const res = await axios.put(`${AUTH_API_BASE_URL}/profile`, values, {
        withCredentials: true,
      });

      if (res.data?.success) {
        // backend returns updated user? If not, hit check-auth or rely on response.
        // If updateUser endpoint returns updated user, use it:
        const updatedUser = res.data.user ?? { ...user, phoneNumber: values.phoneNumber };
        console.log("Profile updated:", updatedUser);
        // update store
        setAuthenticatedUser(updatedUser, true);
        await queryClient.invalidateQueries({ queryKey: ['authStatus'], exact: false });
        toast.success("Profile updated!");
        // initialize other stores will be handled by AuthInitializer or calling code
        console.log("Before navigate, store:", useAuthStore.getState());
        navigate("/", { replace: true });
        console.log("After navigate called");
      } else {
        throw new Error(res.data?.message || "Failed to update profile");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Update failed";
      toast.error("Failed to update profile", { description: msg });
    }
  }

  return (
    <AuthLayout
    title="Log in to your account"
    description="Welcome back! Please enter your details."
  >
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Complete your profile</h2>
      <p className="mb-4">We need your phone number to finish setting up your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone number</label>
          <PhoneInput
            international
            defaultCountry="US"
            value={undefined}
            onChange={(val: any) => setValue("phoneNumber", val || "")}
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? "Saving..." : "Save phone number"}
        </button>
      </form>
    </div>
    </AuthLayout>
  );
};

export default CompleteProfile;
