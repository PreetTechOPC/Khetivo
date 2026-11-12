"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, Mail, Sprout } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  // Form states
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const googleEmail = "farmer.jaswinder@gmail.com";

  // Flow step: "form" | "otp" | "google_phone"
  const [step, setStep] = useState<"form" | "otp" | "google_phone">("form");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [otpError, setOtpError] = useState<string>("");

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, otpTimer]);

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpValues];
    if (val.length > 1) {
      const chars = val.replace(/\D/g, "").slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtpValues(newOtp);
      const focusIndex = Math.min(chars.length, 5);
      const nextInput = document.getElementById(`signup-otp-${focusIndex}`);
      nextInput?.focus();
      return;
    }
    newOtp[index] = val;
    setOtpValues(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`signup-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`signup-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValues.join("");
    if (entered.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    setOtpError("");
    setLoading(true);
    if (typeof window !== "undefined") {
      if (phoneNumber) localStorage.setItem("khetivo_user_phone", phoneNumber);
      if (email) localStorage.setItem("khetivo_user_email", email);
    }
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    }, 600);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Check if user already created an account with a phone number
      const savedPhone = typeof window !== "undefined" ? localStorage.getItem("khetivo_user_phone") : null;
      if (savedPhone) {
        // Already created -> No need to enter phone number again! Direct dashboard access
        setPhoneNumber(savedPhone);
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 600);
      } else {
        // Creating account with Google / first time -> Ask phone number!
        setPhoneNumber("");
        setPhoneError("");
        setStep("google_phone");
      }
    }, 450);
  };

  const handleGooglePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setPhoneError("Please enter your complete 10-digit mobile number.");
      return;
    }
    setPhoneError("");
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("khetivo_user_phone", phoneNumber);
      localStorage.setItem("khetivo_user_email", googleEmail);
    }
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setOtpTimer(30);
      setOtpValues(["", "", "", "", "", ""]);
      setOtpError("");
    }, 500);
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
                {step === "google_phone" ? (
                  <>
                    One last step! <br />
                    Link your phone for <br />
                    <span className="text-[#F9B21B]">farm alerts.</span>
                  </>
                ) : step === "otp" ? (
                  <>
                    Almost there! <br />
                    Verify to unlock your <br />
                    <span className="text-[#F9B21B]">farm dashboard.</span>
                  </>
                ) : mode === "signup" ? (
                  <>
                    Convert your land <br />
                    into predictable <br />
                    <span className="text-[#F9B21B]">prosperity.</span>
                  </>
                ) : (
                  <>
                    Smart farming <br />
                    intelligence at <br />
                    <span className="text-[#F9B21B]">your fingertips.</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
                {step === "google_phone"
                  ? "We use your phone number to dispatch real-time soil moisture alerts and Mandi SMS."
                  : step === "otp"
                  ? "A 6-digit one-time code was sent to your registered contact to securely verify your identity."
                  : "Real-time soil moisture, AI leaf diagnostics, and live mandi intelligence."}
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

          {/* RIGHT SIDE: Authentication / OTP Form */}
          <div className="md:col-span-7 flex flex-col justify-center py-2 md:py-4 px-2 sm:px-4">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F3EB] text-[var(--color-secondary)] flex items-center justify-center mx-auto border border-[#C6E2D0]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {step === "google_phone"
                    ? "Phone Linked & Account Created!"
                    : step === "otp"
                    ? "Account Verified Successfully!"
                    : mode === "signup"
                    ? "Account Created!"
                    : "Signed In Successfully"}
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
            ) : step === "google_phone" ? (
              /* GOOGLE ACCOUNT PHONE NUMBER PROMPT */
              <div>
                {/* Brand Emblem / Connected Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#E7F3EB] border border-[#C6E2D0] flex items-center justify-center text-[var(--color-secondary)] shadow-xs">
                      <Sprout className="w-5 h-5 text-[var(--color-secondary)]" strokeWidth={2.2} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F8F4] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text)]">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span className="truncate max-w-[140px] sm:max-w-[180px]">{googleEmail}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setPhoneError("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-tight">
                    Add Your Phone Number
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-normal leading-relaxed">
                    Your Google account is connected. Please provide your mobile number to link farm sensor telemetry and Kisan SMS alerts.
                  </p>
                  <div className="w-full h-px bg-[var(--color-border)] mt-3" />
                </div>

                {/* Form */}
                <form onSubmit={handleGooglePhoneSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="google-phone"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      Mobile number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] pointer-events-none select-none border-r border-[var(--color-border)] pr-2.5">
                        <span>+91</span>
                      </div>
                      <input
                        id="google-phone"
                        type="tel"
                        required
                        autoFocus
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setPhoneError("");
                        }}
                        className="w-full pl-16 pr-3.5 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--color-text-muted)] leading-normal">
                    This phone number will be securely linked to your account. You will not be asked to enter it again on future Google sign-ins.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-sm font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Save & Open Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : step === "otp" ? (
              /* OTP VERIFICATION SCREEN */
              <div>
                {/* Brand Emblem / Mail Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="w-11 h-11 rounded-full bg-[#E7F3EB] border border-[#C6E2D0] flex items-center justify-center text-[var(--color-secondary)] shadow-xs">
                    <Mail className="w-5 h-5 text-[var(--color-secondary)]" strokeWidth={2.2} />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtpError("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change details</span>
                  </button>
                </div>

                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-tight">
                    Verify Your Account
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-normal leading-relaxed">
                    We have sent a 6-digit OTP code to{" "}
                    <span className="font-semibold text-[var(--color-text)]">
                      {phoneNumber ? `+91 ${phoneNumber}` : email || "your registered contact"}
                    </span>
                  </p>
                  <div className="w-full h-px bg-[var(--color-border)] mt-3" />
                </div>

                {/* 6 Digit Input Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-[var(--color-text)]">
                        Enter 6-digit verification code
                      </label>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        Auto-advancing
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      {otpValues.map((digit, index) => (
                        <input
                          key={index}
                          id={`signup-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 sm:w-11 h-12 text-center text-lg font-semibold text-[var(--color-text)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all shadow-xs"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        {otpError}
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-sm font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Activate Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend Timer & Links */}
                  <div className="pt-2 text-center space-y-2">
                    {otpTimer > 0 ? (
                      <p className="text-xs text-[var(--color-text-muted)] font-normal">
                        Didn&apos;t receive code? Resend in{" "}
                        <span className="font-semibold text-[var(--color-primary)]">
                          0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(30);
                          setOtpValues(["", "", "", "", "", ""]);
                          setOtpError("");
                          const firstBox = document.getElementById("signup-otp-0");
                          firstBox?.focus();
                        }}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                      >
                        Didn&apos;t receive code? Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              /* STANDARD FORM (Google + Email) */
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
                    {mode === "signup" ? "Get Started" : "Welcome Back"}
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 font-normal">
                    {mode === "signup"
                      ? "Welcome to Khetivo — Let's get started"
                      : "Welcome back to Khetivo — Sign in to your farm"}
                  </p>
                  <div className="w-full h-px bg-[var(--color-border)] mt-3" />
                </div>

                {/* Google Sign In Button (Checks existing phone) */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background)] text-[var(--color-text)] font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer mb-1"
                >
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
                  <span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-2.5">
                  <div className="w-full border-t border-[var(--color-border)]" />
                  <span className="bg-[var(--color-surface)] px-2.5 text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">
                    or continue with email
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full name input (Only in Sign Up mode) */}
                  {mode === "signup" && (
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                      >
                        Your name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="e.g. Jaswinder Singh"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                      />
                    </div>
                  )}

                  {/* Phone number input (Only in Sign Up mode) */}
                  {mode === "signup" && (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                      >
                        Phone number
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] pointer-events-none select-none border-r border-[var(--color-border)] pr-2.5">
                          <span>+91</span>
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full pl-16 pr-3.5 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email / Mobile input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-[var(--color-text)] mb-1.5"
                    >
                      {mode === "signup" ? "Email address" : "Your email or mobile"}
                    </label>
                    <input
                      id="email"
                      type={mode === "signup" ? "email" : "text"}
                      required
                      placeholder={mode === "signup" ? "farmer@khetivo.in" : "farmer@khetivo.in or mobile"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                    />
                  </div>

                  {/* Password input with toggle visibility */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label
                        htmlFor="password"
                        className="text-xs font-medium text-[var(--color-text)]"
                      >
                        {mode === "signup" ? "Create new password" : "Password"}
                      </label>
                      {mode === "signin" && (
                        <a
                          href="#forgot"
                          onClick={(e) => {
                            e.preventDefault();
                            alert("A password reset link will be sent to your email or mobile.");
                          }}
                          className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-[var(--radius-input)] border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/15 outline-none transition-all placeholder:text-[var(--color-text-muted)]/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button (Theme based) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full py-3 text-sm font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : mode === "signup" ? (
                      "Create new account"
                    ) : (
                      "Sign in to account"
                    )}
                  </button>
                </form>

                {/* Footer mode toggle */}
                <div className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
                  {mode === "signup" ? (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signin");
                          setStep("form");
                        }}
                        className="font-semibold text-[var(--color-primary)] underline hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer"
                      >
                        Sign in
                      </button>
                    </span>
                  ) : (
                    <span>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setStep("form");
                        }}
                        className="font-semibold text-[var(--color-primary)] underline hover:text-[var(--color-primary-hover)] transition-colors cursor-pointer"
                      >
                        Create an account
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
