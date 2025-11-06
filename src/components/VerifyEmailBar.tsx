// components/VerifyEmailBar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import * as authApi from '@/lib/authApi'; 
import axios from "axios";
import { Spinner } from "./ui/Spinner";
import { Button } from "./ui/button";
/**
 * Always visible bar for logged-in users who haven't verified email.
 * No dismiss button. Disappears only when isVerified becomes true.
 */
const VerifyEmailBar: React.FC = () => {
  const { isAuthenticated, isVerified, user,setSignupProgress} = useAuthStore();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  // show only for logged-in, unverified users
  if (!isAuthenticated || isVerified) return null;
  const email = user?.email || "";
  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      const response = await authApi.resendVerificationCode({ email });
      if (response.success) {
        toast.success("Code Resent", {
          description: "A new verification code has been sent to your email.",
        });
      }
    } catch (error: any) {
      let errorMessage = "Failed to resend code. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      toast.error("Resend Failed", {
        description: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
    try {
    
      toast.success("Verification email sent. Check your inbox.");
    } catch (err) {
      console.error("resendVerification failed", err);
      toast.error("Couldn't send verification email. Try again.");
    }
  };
    const handleRedirect = () => {
        setSignupProgress(email); // Update auth store
        navigate('/verify-email', { state: { email }, replace: true });
    };
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900" role="region" aria-label="Email verification required">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <div className="text-sm">
            <div className="font-medium">Verify your email</div>
            <div className="text-xs opacity-90">
              Please check your inbox to confirm your account. Didn't receive it? Use the button on the right.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResendCode} disabled={isResending}
            className="px-3 py-1 rounded-md text-sm bg-amber-600 text-white hover:opacity-90"
            aria-label="Resend verification email"
          >
            {isResending ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size={18} color="text-white" />
                          <span>Resending...</span>
                        </div>
                      ) : (
              "Resend Code"
            )}
          </button>

          <Button
            onClick={handleRedirect}
            className="px-3 py-1 rounded-md text-sm border border-amber-600 text-amber-700 hover:bg-amber-100"
          >
            Verify now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailBar;
