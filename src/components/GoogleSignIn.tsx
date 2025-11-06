import React, { useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Props = {
  buttonText?: string;
  className?: string;
  onSuccessRedirect?: string; // optional path to redirect on success
};
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL

const GoogleSignIn: React.FC<Props> = ({ buttonText = "Sign in with Google", className, onSuccessRedirect = "/" }) => {
  const navigate = useNavigate();
  const { setAuthenticatedUser /* adapt to your store API */ } = useAuthStore();
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = "977123917255-kjjmv0lmbf63rdv2oe63qdgthe5dnup6.apps.googleusercontent.com";
    if (!clientId) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID");
      return;
    }

    // Load GIS script if not already present
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initButton;
      return () => { script.remove(); };
    } else {
      initButton();
    }

    function initButton() {
      const google = (window as any).google;
      if (!google) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      // render a Google-branded button into divRef
      if (divRef.current) {
        google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCredentialResponse(response: any) {
    // response.credential is the id_token
    const idToken = response?.credential;
    if (!idToken) {
      toast.error("Google sign-in failed (no token).");
      return;
    }

    try {
      const res = await axios.post(
       `${AUTH_API_BASE_URL}/google`,
        { idToken },
        { withCredentials: true } // IMPORTANT so cookies set by server are stored
      );

      if (res.data?.success) {
        // update your client auth store — adapt to your store API
        setAuthenticatedUser(res.data.user); // example
        toast.success("Signed in with Google!");

        // If backend returned user missing real phoneNumber (placeholder), redirect to profile
        const user = res.data.user || {};
        if (!user.phoneNumber) {
          // route to profile completion to set real phone number
          navigate("/complete-profile", { replace: true });
          return;
        }

        // normal redirect
        navigate(onSuccessRedirect, { replace: true });
      } else {
        throw new Error(res.data?.message || "Google auth failed");
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
      const msg = err?.response?.data?.message || err.message || "Google sign-in failed";
      toast.error("Google sign-in failed", { description: msg });
    }
  }

  return (
    <div className={className}>
      {/* The library will render the button inside this div */}
      <div ref={divRef} />
      {/* Optionally keep a fallback button if GIS can't load: */}
      <noscript>
        <button
          onClick={() => toast("Enable JavaScript to use Google sign-in")}
          className="mt-2 w-full"
        >
          {buttonText}
        </button>
      </noscript>
    </div>
  );
};

export default GoogleSignIn;
