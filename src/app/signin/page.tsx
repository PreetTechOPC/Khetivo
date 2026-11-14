"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, Sprout } from "lucide-react";
import {
  sanitizePhone,
  saveRegisteredUser,
  findUserByIdentifier,
} from "@/lib/authStore";
import { signInWithGoogleAppwrite } from "@/lib/appwriteAuth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "oauth_failed") {
        setPhoneError("Google authentication with Appwrite was cancelled or failed. Please try again.");
      }
    }
  }, []);

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      setPhoneError("");
      await signInWithGoogleAppwrite("/dashboard");
    } catch (err: any) {
      setGoogleLoading(false);
      setPhoneError(err?.message || "Failed to initiate Appwrite Google sign-in.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    if (!email.trim()) {
      setPhoneError("Please enter your Mobile Number, Gmail, or Farmer ID.");
      return;
    }

    if (!password || password.length < 4) {
      setPhoneError("Please enter your account password (at least 4 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setPhoneError(data.message || "Invalid credentials. Please try again.");
        return;
      }

      // Save user to client session
      saveRegisteredUser({
        name: data.user.name,
        phone: data.user.phone,
        email: data.user.email,
        provider: "phone",
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } catch {
      setLoading(false);
      setPhoneError("Network error signing in. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#072417] selection:bg-[var(--color-accent)] selection:text-[#26352D]">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="fixed top-5 left-5 inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm transition-colors border border-white/15 z-20"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Khetivo</span>
      </Link>

      {/* Main Centered Card matching reference design with Khetivo theme */}
      <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden border border-[#DCE6DE]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch">
          
          {/* LEFT SIDE: Khetivo Precision Agritech Showcase Card */}
          <div className="md:col-span-5 relative min-h-[300px] md:min-h-[480px] bg-gradient-to-br from-[#0C4B32] via-[#0E5338] to-[#062418] rounded-[22px] p-6 md:p-7 flex flex-col justify-between overflow-hidden shadow-inner border border-white/15">
            {/* Subtle Organic Field Texture overlay */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[var(--color-secondary)]/25 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[var(--color-accent)]/20 blur-2xl pointer-events-none" />

            {/* Left Card Top Typography */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#86EFAC] text-xs font-medium border border-white/20 backdrop-blur-xs">
                <Sprout className="w-3.5 h-3.5 text-[#86EFAC]" />
                <span>Precision Farm OS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold !text-white tracking-tight leading-snug">
                Smart farming <br />
                intelligence at <br />
                <span className="text-[#F9B21B]">your fingertips.</span>
              </h2>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
                Direct sign-in for registered farmers. Access real-time IoT soil moisture, telemetry, and live mandi intelligence.
              </p>
            </div>

            {/* Left Card Bottom Feature Highlights & Trust Note */}
            <div className="relative z-10 space-y-2.5 mt-auto pt-6">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Real-time IoT soil & moisture telemetry</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Instant AI leaf disease diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/90">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Live 1,400+ APMC mandi market intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/85">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Trusted by 45,000+ farmers across 9 states</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Direct Sign In Form (NO OTP FOR SIGNIN USERS) */}
          <div className="md:col-span-7 flex flex-col justify-center py-2 md:py-4 px-2 sm:px-4">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F3EB] text-[var(--color-secondary)] flex items-center justify-center mx-auto border border-[#C6E2D0]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  Signed In Successfully!
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
                  Redirecting to your Khetivo Farm Operations Dashboard...
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block mt-3 px-5 py-2 text-xs font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-[var(--radius-button)] shadow-xs transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div>
                {/* Brand Emblem Badge */}
                <div className="mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#E7F3EB] border border-[#C6E2D0] flex items-center justify-center text-[var(--color-secondary)] shadow-xs">
                    <Sprout className="w-6 h-6 text-[var(--color-secondary)]" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-tight">
                    Sign In to Khetivo
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-normal">
                    Sign in with your registered account credentials (no OTP needed)
                  </p>
                  <div className="w-full h-px bg-[var(--color-border)] mt-3" />
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background)] text-[var(--color-text)] font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer mb-1 disabled:opacity-60"
                >
                  {googleLoading ? (
                    <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  )}
                  <span>{googleLoading ? "Connecting to Appwrite..." : "Sign in with Google"}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-2.5">
                  <div className="w-full border-t border-[var(--color-border)]" />
                  <span className="bg-[var(--color-surface)] px-2.5 text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
                    or sign in with credentials
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Email / Mobile / Farmer ID */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Mobile Phone, Gmail, or Farmer ID
                    </label>
                    <input
                      id="email"
                      type="text"
                      required
                      placeholder="e.g. 98140-54321, farmer@gmail.com, or KHET-98140"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setPhoneError("");
                      }}
                      className="w-full px-3.5 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label
                        htmlFor="password"
                        className="text-xs font-medium text-[var(--color-text)]"
                      >
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("A password reset link will be sent to your registered contact.");
                        }}
                        className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPhoneError("");
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1 font-medium">{phoneError}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-sm font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Farm Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer link to Sign Up */}
                <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
                  <span>
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-[var(--color-primary)] hover:underline ml-1"
                    >
                      Create an account (Free 14-Day Trial)
                    </Link>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
