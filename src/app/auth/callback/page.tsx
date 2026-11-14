"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sprout, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { handleAppwriteOAuthCallback } from "@/lib/appwriteAuth";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [farmerName, setFarmerName] = useState("");

  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    // If Appwrite returned error directly via query parameter
    if (errorParam) {
      setStatus("error");
      setErrorMessage("Google authentication was cancelled or could not be completed by Appwrite.");
      return;
    }

    let isMounted = true;

    async function processAuth() {
      try {
        const result = await handleAppwriteOAuthCallback();
        if (!isMounted) return;

        if (result.success && result.user) {
          setStatus("success");
          setFarmerName(result.user.name);
          setTimeout(() => {
            router.push(redirectTarget);
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Unable to complete Google sign-in via Appwrite.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setErrorMessage(err?.message || "An unexpected error occurred during Appwrite verification.");
      }
    }

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [errorParam, redirectTarget, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#072417] text-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-[#26352D] shadow-2xl border border-[#DCE6DE] text-center space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] flex items-center justify-center shadow-xs">
            <Sprout className="w-6 h-6 text-[#0C4B32]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0C4B32]">Khetivo</span>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-4 py-4">
            <div className="relative w-14 h-14 mx-auto">
              <div className="w-14 h-14 border-4 border-[#C6E2D0] border-t-[#0C4B32] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#26352D]">
                Authenticating with Appwrite...
              </h3>
              <p className="text-xs text-[#55685D] mt-1 max-w-xs mx-auto">
                Validating your Google credentials with Appwrite Cloud and establishing your farmer session.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#26352D]">
                Welcome, {farmerName}!
              </h3>
              <p className="text-xs text-[#55685D] mt-1">
                Google account verified successfully via Appwrite. Redirecting to your dashboard...
              </p>
            </div>
            <Link
              href={redirectTarget}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#26352D]">
                Authentication Failed
              </h3>
              <p className="text-xs text-red-600 mt-1 max-w-xs mx-auto">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#0C4B32] hover:bg-[#083624] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
              <Link
                href="/"
                className="text-xs text-[#55685D] hover:text-[#0C4B32] underline"
              >
                Back to Khetivo Home
              </Link>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-[#E5ECE7] text-[11px] text-[#889B90]">
          Secured by Appwrite Cloud & Google Identity Services
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#072417] text-white">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
