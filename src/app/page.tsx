"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Wheat,
  Droplets,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Download,
  Calendar,
  ChevronDown,
  X,
  Star,
  MapPin,
  Layers,
  Menu,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  Clock,
  Compass,
  DollarSign,
  Activity,
  Cpu,
  Award,
  Check,
  Users,
  Lock,
  Wrench,
  Radio,
  FileText,
  Building2,
  Package,
} from "lucide-react";
import {
  isPhoneAlreadyVerified,
  sanitizePhone,
  saveRegisteredUser,
  findUserByIdentifier,
  sendRealOtpApi,
  verifyRealOtpApi,
} from "@/lib/authStore";
import { signInWithGoogleAppwrite } from "@/lib/appwriteAuth";

export default function Home() {
  const router = useRouter();

  // Navigation & Modal states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [phoneForSms, setPhoneForSms] = useState("");

  // Auth Popup States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authStep, setAuthStep] = useState<"form" | "otp" | "google_phone">("form");
  const [authIdentifier, setAuthIdentifier] = useState(""); // Phone, Gmail or Farmer ID for Sign In
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPhoneError, setAuthPhoneError] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [alreadyVerifiedNotice, setAlreadyVerifiedNotice] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [otpError, setOtpError] = useState<string>("");
  const [otpDispatchedPhone, setOtpDispatchedPhone] = useState<string>("");

  // User session state: check if user is already logged in / signed up
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const checkUserSession = () => {
      const uPhone = localStorage.getItem("khetivo_user_phone");
      const uEmail = localStorage.getItem("khetivo_user_email");
      const uAppwrite = localStorage.getItem("khetivo_appwrite_user_id");
      const uFarmer = localStorage.getItem("khetivo_farmer_id");
      setIsLoggedIn(Boolean(uPhone || uEmail || uAppwrite || uFarmer));
    };

    checkUserSession();
    window.addEventListener("storage", checkUserSession);
    return () => window.removeEventListener("storage", checkUserSession);
  }, []);

  const handleDashboardOrLoginClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      setAuthMode("signin");
      setAuthStep("form");
      setAuthPhoneError("");
      setAlreadyVerifiedNotice(false);
      setAuthModalOpen(true);
    }
  };

  // Testimonial Auto-Slider State
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  const testimonialsList = [
    {
      id: "t1",
      name: "Harinderjit Singh",
      location: "Moga, Punjab • 42 Acres",
      initials: "HS",
      avatarBg: "bg-[#0C4B32]",
      badge: "Verified Grower",
      quote:
        "Earlier, I ran my tubewell on guesswork every 4 days. With Khetivo's soil sensors, I learned my loam soil holds water longer. Checking my phone before morning watering saved us over ₹22,000 in electricity and diesel bills per season while keeping crop health at its peak.",
      image: "/farmer-testimonial.jpg",
      metric1Val: "40%",
      metric1Lbl: "Water Pump Fuel Saved",
      metric2Val: "+2.4 Qtl",
      metric2Lbl: "Extra Yield / Acre",
      metric3Val: "100%",
      metric3Lbl: "On-Time Disease Alert",
    },
    {
      id: "t2",
      name: "Ramesh Patil",
      location: "Jalgaon, Maharashtra • 18 Acres",
      initials: "RP",
      avatarBg: "bg-[#278449]",
      badge: "Cotton Specialist",
      quote:
        "The AI leaf scanner saved our cotton crop. When pink bollworm symptoms started, the app diagnosed it within 5 seconds and recommended a specific organic spray before it could spread across other plots.",
      image: "/hero-farmer.jpg",
      metric1Val: "96%",
      metric1Lbl: "Early Pest Detection",
      metric2Val: "₹18,500",
      metric2Lbl: "Crop Loss Prevented",
      metric3Val: "0%",
      metric3Lbl: "Excess Chemical Spray",
    },
    {
      id: "t3",
      name: "Virendra Kumar",
      location: "Hoshangabad, MP • FPO Chairman",
      initials: "VK",
      avatarBg: "bg-[#26352D]",
      badge: "350+ Member FPO",
      quote:
        "Our FPO manages 350+ smallholder members. Khetivo gave our field staff one centralized screen to monitor collective soil parameters and coordinate bulk mandi sales at ₹120 above local middlemen.",
      image: "/farmer-testimonial.jpg",
      metric1Val: "+₹120",
      metric1Lbl: "Above Local Mandi Rate",
      metric2Val: "350+",
      metric2Lbl: "Farmers Coordinated",
      metric3Val: "100%",
      metric3Lbl: "Transparent Ledger",
    },
    {
      id: "t4",
      name: "Gursewak Singh Dhillon",
      location: "Bathinda, Punjab • 65 Acres",
      initials: "GD",
      avatarBg: "bg-[#0C4B32]",
      badge: "Progressive Wheat Grower",
      quote:
        "Managing machinery fleet and multiple holdings across 3 villages used to give me headaches. Now all our tractors, rotavators, and diesel logs are synced to our farm parcels, with zero service delays.",
      image: "/hero-farmer.jpg",
      metric1Val: "6 Units",
      metric1Lbl: "Machinery Fleet Tracked",
      metric2Val: "0 Hours",
      metric2Lbl: "Harvest Breakdown Downtime",
      metric3Val: "₹34,000",
      metric3Lbl: "Diesel Expense Saved",
    },
  ];

  // Auto-slide every 4.5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonialsList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonialsList.length]);

  // OTP Countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpTimer]);

  // Auto-send OTP when 10-digit phone number is entered during signup
  React.useEffect(() => {
    if (authMode !== "signup") return;
    const clean = sanitizePhone(authPhone);
    if (clean.length === 10) {
      if (otpDispatchedPhone === clean) return; // already triggered for this number

      // Check if already verified
      if (isPhoneAlreadyVerified(clean)) {
        setAuthPhoneError(`Phone number +91 ${clean} has already completed one-time OTP verification. Please sign in directly.`);
        setAlreadyVerifiedNotice(true);
        return;
      }

      setAuthPhoneError("");
      setAlreadyVerifiedNotice(false);
      setOtpError("");
      setOtpValues(["", "", "", "", "", ""]);
      setAuthLoading(true);

      sendRealOtpApi(clean).then((res) => {
        setAuthLoading(false);
        setOtpDispatchedPhone(clean);
        if (!res.success) {
          setAuthPhoneError(res.message);
          if (res.alreadyVerified) setAlreadyVerifiedNotice(true);
        } else {
          setOtpTimer(60);
          setTimeout(() => {
            const firstBox = document.getElementById("auth-otp-inline-0");
            firstBox?.focus();
          }, 100);
        }
      });
    } else {
      // If user deletes or changes digits below 10, reset dispatched tracker if different
      if (otpDispatchedPhone && clean.length < 10) {
        setOtpDispatchedPhone("");
      }
    }
  }, [authPhone, authMode, otpDispatchedPhone]);

  const handleInlineOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpValues];
    if (val.length > 1) {
      const chars = val.replace(/\D/g, "").slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtpValues(newOtp);
      const focusIndex = Math.min(chars.length, 5);
      const nextInput = document.getElementById(`auth-otp-inline-${focusIndex}`);
      nextInput?.focus();
      return;
    }
    newOtp[index] = val;
    setOtpValues(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`auth-otp-inline-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleInlineOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-inline-${index - 1}`);
      prevInput?.focus();
    }
  };

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
      const nextInput = document.getElementById(`auth-otp-${focusIndex}`);
      nextInput?.focus();
      return;
    }
    newOtp[index] = val;
    setOtpValues(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Real OTP Verification (Strictly One-Time Process for Signup Only)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpValues.join("");
    if (entered.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    setOtpError("");
    setAuthLoading(true);

    const clean = sanitizePhone(authPhone);
    const result = await verifyRealOtpApi(clean, entered, {
      name: authFullName || "Jaswinder Singh",
      email: authEmail || (authStep === "google_phone" ? "farmer.jaswinder@gmail.com" : `${clean}@khetivo.farm`),
    });

    setAuthLoading(false);

    if (!result.success) {
      setOtpError(result.message);
      if (result.alreadyVerified) {
        setAlreadyVerifiedNotice(true);
      }
      return;
    }

    setAuthSuccess(true);
    setAuthSuccessMsg("Mobile Number Verified Successfully! Welcome to Khetivo.");
    setTimeout(() => {
      setAuthModalOpen(false);
      router.push("/dashboard");
    }, 700);
  };

  const handleResendOtp = async () => {
    const clean = sanitizePhone(authPhone);
    if (isPhoneAlreadyVerified(clean)) {
      setOtpError("This user is already verified and registered. Please sign in directly.");
      return;
    }
    setAuthLoading(true);
    setOtpError("");
    const res = await sendRealOtpApi(clean);
    setAuthLoading(false);
    if (!res.success) {
      setOtpError(res.message);
      if (res.alreadyVerified) setAlreadyVerifiedNotice(true);
      return;
    }
    setOtpTimer(60);
    setOtpValues(["", "", "", "", "", ""]);
    const firstBox = document.getElementById("auth-otp-0");
    firstBox?.focus();
  };

  const handleGoogleSignInClick = async () => {
    setAuthLoading(true);
    setAuthPhoneError("");
    setAlreadyVerifiedNotice(false);

    try {
      await signInWithGoogleAppwrite("/dashboard");
    } catch (err: any) {
      setAuthLoading(false);
      setAuthPhoneError(err?.message || "Failed to start Google sign in with Appwrite.");
    }
  };

  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizePhone(authPhone);
    if (clean.length < 10) {
      setAuthPhoneError("Please enter your complete 10-digit mobile number.");
      return;
    }

    // Check if phone has already been verified
    if (isPhoneAlreadyVerified(clean)) {
      setAuthPhoneError(`Phone number +91 ${clean} has already been verified. Sign-up OTP is a one-time process. Please sign in directly.`);
      setAlreadyVerifiedNotice(true);
      return;
    }

    setAuthPhoneError("");
    setAlreadyVerifiedNotice(false);
    setAuthLoading(true);

    const res = await sendRealOtpApi(clean);
    setAuthLoading(false);

    if (!res.success) {
      setAuthPhoneError(res.message);
      if (res.alreadyVerified) setAlreadyVerifiedNotice(true);
      return;
    }

    setAuthStep("otp");
    setOtpTimer(60);
    setOtpValues(["", "", "", "", "", ""]);
    setOtpError("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthPhoneError("");
    setAlreadyVerifiedNotice(false);

    // =========================================================================
    // SIGN IN: DIRECT CREDENTIALS LOGIN (NO OTP!)
    // =========================================================================
    if (authMode === "signin") {
      const idVal = authIdentifier.trim();
      if (!idVal) {
        setAuthPhoneError("Please enter your Mobile Number, Gmail, or Farmer ID.");
        return;
      }
      if (!authPassword || authPassword.length < 4) {
        setAuthPhoneError("Please enter your account password.");
        return;
      }

      setAuthLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: idVal, password: authPassword }),
        });
        const data = await res.json();
        setAuthLoading(false);

        if (!res.ok || !data.success) {
          setAuthPhoneError(data.message || "Invalid credentials. Please try again.");
          return;
        }

        saveRegisteredUser({
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          provider: "phone",
        });
        setIsLoggedIn(true);
        setAuthSuccess(true);
        setAuthSuccessMsg("Signed in successfully via Appwrite.");
        setTimeout(() => {
          setAuthModalOpen(false);
          router.push("/dashboard");
        }, 600);
      } catch {
        setAuthLoading(false);
        setAuthPhoneError("Network error signing in. Please try again.");
      }
      return;
    }

    // =========================================================================
    // SIGN UP: REAL OTP VERIFICATION (ONE-TIME PROCESS)
    // =========================================================================
    const clean = sanitizePhone(authPhone);
    if (clean.length < 10) {
      setAuthPhoneError("Please enter your complete 10-digit mobile number.");
      return;
    }

    // Enforce: OTP verification is a one-time process for signup only
    if (isPhoneAlreadyVerified(clean)) {
      setAuthPhoneError(
        `This mobile number (+91 ${clean}) has already completed one-time OTP verification. An account already exists. Please sign in directly.`
      );
      setAlreadyVerifiedNotice(true);
      return;
    }

    if (!authFullName.trim()) {
      setAuthPhoneError("Please enter your full name.");
      return;
    }

    if (!authEmail.trim()) {
      setAuthPhoneError("Please enter your Gmail / Email ID.");
      return;
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthPhoneError("Password must be at least 6 characters.");
      return;
    }

    const enteredOtp = otpValues.join("");
    if (enteredOtp.length < 6) {
      setOtpError("Please enter the 6-digit verification code sent to your mobile number.");
      return;
    }

    setOtpError("");
    setAuthLoading(true);

    const result = await verifyRealOtpApi(clean, enteredOtp, {
      name: authFullName.trim(),
      email: authEmail.trim(),
      password: authPassword,
    });

    setAuthLoading(false);

    if (!result.success) {
      setOtpError(result.message);
      if (result.alreadyVerified) {
        setAlreadyVerifiedNotice(true);
      }
      return;
    }

    setIsLoggedIn(true);
    setAuthSuccess(true);
    setAuthSuccessMsg("Account Created & Verified Successfully! Welcome to Khetivo.");
    setTimeout(() => {
      setAuthModalOpen(false);
      router.push("/dashboard");
    }, 700);
  };

  // Pricing toggle: monthly vs annual
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  // ROI Calculator states
  const [farmAcres, setFarmAcres] = useState<number>(20);
  const [cropType, setCropType] = useState<string>("Wheat & Paddy");
  const [irrigationType, setIrrigationType] = useState<string>("Tubewell / Sub-surface");

  // FAQ Accordion open index
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form states for Demo Request Modal
  const [demoForm, setDemoForm] = useState({
    name: "",
    phone: "",
    acres: "15-50",
    state: "Punjab",
    crop: "Wheat & Paddy",
    mode: "field",
  });

  // Calculate dynamic ROI values
  const estimatedWaterSaved = farmAcres * 36000; // liters per year
  const estimatedInputSaved = farmAcres * 3500; // ₹ per year
  const estimatedYieldBoost = farmAcres * 9200; // ₹ per year
  const totalNetGain = estimatedInputSaved + estimatedYieldBoost;

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const handleSmsDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneForSms.trim().length >= 10) {
      setSmsSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col selection:bg-[#C6E2D0] selection:text-[#0C4B32]">
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT BANNER                                                */}
      {/* ========================================================================= */}
      <div className="bg-[#0C4B32] text-white text-xs py-2 px-4 text-center font-medium border-b border-[#278449]/40 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-[#278449] text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">
          <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
          KHARIF & RABI 2026-27 ADVISORY LIVE
        </span>
        <span className="hidden sm:inline text-white/90">
          Smart Irrigation & Yellow Rust Warning Network active across 45,000+ acres in Punjab & Haryana.
        </span>
        <button
          type="button"
          onClick={() => {
            setAuthMode("signup");
            setAuthStep("form");
            setAuthModalOpen(true);
          }}
          className="underline hover:text-[#F9B21B] font-semibold ml-1 cursor-pointer"
        >
          Join Free Today →
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. HEADER & NAVIGATION BAR                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-[var(--color-border)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <Image
              src="/logo-khetivo-cropped.png"
              alt="Khetivo - Smart Intelligence for Every Farm"
              width={180}
              height={52}
              className="h-10 sm:h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[var(--color-text)]">
            <a href="#about" className="hover:text-[var(--color-secondary)] transition-colors">
              About Us
            </a>
            <a href="#features" className="hover:text-[var(--color-secondary)] transition-colors">
              Farmer OS Features
            </a>
            <a href="#solutions" className="hover:text-[var(--color-secondary)] transition-colors">
              Smart Solutions
            </a>
            <a href="#calculator" className="hover:text-[var(--color-secondary)] transition-colors">
              ROI Calculator
            </a>
            <a href="#how-it-works" className="hover:text-[var(--color-secondary)] transition-colors">
              How It Works
            </a>
          </nav>

          {/* Desktop CTA Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setDemoSubmitted(false);
                setDemoModalOpen(true);
              }}
              className="btn btn-primary text-xs px-4 py-2 font-medium cursor-pointer shadow-xs"
            >
              Request Free Demo
            </button>
            <button
              type="button"
              onClick={handleDashboardOrLoginClick}
              className="px-3.5 py-2 rounded-xl bg-[#E7F3EB] text-[#0C4B32] hover:bg-[#D4EBDC] border border-[#C6E2D0] text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLoggedIn ? "Dashboard" : "Login"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[var(--color-text)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 pt-3 pb-6 space-y-3.5 animate-in slide-in-from-top-2">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--color-text)] py-1.5"
            >
              About Us
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--color-text)] py-1.5"
            >
              Farmer OS Features
            </a>
            <a
              href="#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--color-text)] py-1.5"
            >
              Smart Solutions
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--color-text)] py-1.5"
            >
              ROI Calculator
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--color-text)] py-1.5"
            >
              How It Works
            </a>
            <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDemoSubmitted(false);
                  setDemoModalOpen(true);
                }}
                className="w-full btn btn-primary py-2.5 text-xs justify-center"
              >
                Request Free Field Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDashboardOrLoginClick();
                }}
                className="w-full py-2.5 rounded-xl bg-[#E7F3EB] text-[#0C4B32] border border-[#C6E2D0] text-xs font-semibold text-center block cursor-pointer"
              >
                {isLoggedIn ? "Open Farmer Dashboard →" : "Login to Account →"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[var(--color-border)] bg-gradient-to-b from-[#F4F8F4] via-white to-[#F4F8F4]">
        {/* Decorative background grid and organic glowing orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(#0C4B32_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-12 left-1/4 w-[500px] h-[350px] bg-[#278449]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-[450px] h-[400px] bg-[#F9B21B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE6DE] shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#278449] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0C4B32]" />
                </span>
                <span className="text-xs font-semibold text-[#0C4B32]">
                  Next-Gen Indian Agriculture & Farm OS
                </span>
                <span className="text-xs text-[#64748B] hidden sm:inline">• 45,000+ Active Acres</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] font-bold tracking-tight text-[#0C4B32] leading-[1.16]">
                Your Complete Digital Farm Operating System.{" "}
                <span className="text-[#278449]">Manage Land, Crops &amp; Machinery</span> From One Unified Dashboard.
              </h1>

              {/* Supporting Subheadline */}
              <p className="text-base sm:text-lg text-[#55685D] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Everything Indian farmers need in one place: live coordinate weather radar, multi-farm GPS parcels, PAU crop growth timelines, field task delegators, store inventory alerts, equipment maintenance logs, and real-time mandi financial ledgers.
              </p>

              {/* Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDemoSubmitted(false);
                    setDemoModalOpen(true);
                  }}
                  className="btn btn-primary text-sm sm:text-base px-6 py-3.5 w-full sm:w-auto shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request a Free Field Demo</span>
                </button>
                <button
                  type="button"
                  onClick={handleDashboardOrLoginClick}
                  className="btn btn-outline text-sm sm:text-base px-6 py-3.5 w-full sm:w-auto inline-flex items-center gap-2 justify-center bg-white hover:bg-[#F4F8F4] transition-colors cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-[#278449]" />
                  <span>{isLoggedIn ? "Explore Farmer Dashboard" : "Login to Farmer Dashboard"}</span>
                  <ArrowRight className="w-4 h-4 text-[#278449] ml-0.5" />
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#DCE6DE]">
                <div className="p-3 rounded-xl bg-white/70 border border-[#E5ECE7] text-left">
                  <div className="text-2xl font-extrabold text-[#0C4B32]">
                    8 Modules
                  </div>
                  <p className="text-xs text-[#55685D] font-medium mt-0.5">
                    Integrated in Dashboard
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#E5ECE7] text-left">
                  <div className="text-2xl font-extrabold text-[#278449]">
                    100%
                  </div>
                  <p className="text-xs text-[#55685D] font-medium mt-0.5">
                    Data Isolation &amp; Privacy
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#E5ECE7] text-left">
                  <div className="text-2xl font-extrabold text-[#0C4B32]">
                    PAU &amp; ICAR
                  </div>
                  <p className="text-xs text-[#55685D] font-medium mt-0.5">
                    Crop &amp; Pest Standard
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#E5ECE7] text-left">
                  <div className="text-2xl font-extrabold text-[#D97706] flex items-center gap-1">
                    Live <CloudSun className="w-4 h-4 text-[#F9B21B]" />
                  </div>
                  <p className="text-xs text-[#55685D] font-medium mt-0.5">
                    Weather API Radar
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Harmonious Composition with Real App Card */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative mx-auto max-w-[440px] sm:max-w-[480px]">
                {/* Decorative Backdrop Glow */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#0C4B32]/15 via-[#278449]/10 to-[#F9B21B]/15 rounded-[36px] blur-xl -z-10" />

                {/* Farmer Photo Main Card */}
                <div className="relative rounded-[28px] overflow-hidden border border-[#DCE6DE] shadow-2xl bg-white group">
                  <Image
                    src="/hero-farmer.jpg"
                    alt="Proud Indian farmer in wheat field using Khetivo"
                    width={640}
                    height={720}
                    className="w-full h-[420px] sm:h-[480px] object-cover object-[center_top] transition-transform duration-700 group-hover:scale-[1.02]"
                    priority
                  />

                  {/* Gradient overlay for soft text contrast at base */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                  {/* Verified Farmer Badge in photo */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/80 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-[#0C4B32]">Live Farm Sensor Sync</span>
                  </div>
                </div>

                {/* Floating Modern App Card: Real Dashboard Intelligence Preview */}
                <div className="absolute -bottom-6 -right-2 sm:-right-5 w-[210px] sm:w-[250px] bg-white rounded-2xl p-3.5 shadow-2xl border border-[#DCE6DE] z-20 space-y-2.5 transition-transform duration-300 hover:-translate-y-1">
                  {/* Card Header: App Brand + Status */}
                  <div className="flex items-center justify-between border-b border-[#E5ECE7] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0C4B32] p-1 flex items-center justify-center shrink-0">
                        <Image
                          src="/khetivo-app-icon.png"
                          alt="Khetivo"
                          width={24}
                          height={24}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#26352D] leading-tight">Farmer Dashboard</div>
                        <div className="text-[9px] text-[#278449] font-semibold">Appwrite Cloud Connected</div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  </div>

                  {/* Soil Moisture & Advisory Metric */}
                  <div className="bg-[#F4F8F4] rounded-xl p-2.5 border border-[#DCE6DE] space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#55685D] font-medium flex items-center gap-1">
                        <CloudSun className="w-3 h-3 text-[#0C4B32]" /> Ludhiana Farm
                      </span>
                      <span className="font-bold text-[#0C4B32]">24°C • Clear</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#55685D]">
                      <span>Humidity: 58%</span>
                      <span>Wind: 12 km/h NW</span>
                    </div>
                    <p className="text-[9px] text-[#0C4B32] font-semibold pt-0.5 border-t border-[#DCE6DE]">
                      Wheat (HD-2967) • Flowering Stage
                    </p>
                  </div>

                  {/* Mandi Rate Micro-Pill */}
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2 py-1 text-[10px]">
                    <span className="text-emerald-900 font-medium">Net Profit Margin</span>
                    <span className="font-bold text-[#0C4B32] flex items-center gap-0.5">
                      +₹20,000 <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                    </span>
                  </div>
                </div>

                {/* Floating Farmer Testimonial Card - Bottom Left */}
                <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md border border-[#DCE6DE] rounded-2xl px-3.5 py-2.5 shadow-xl absolute -bottom-4 -left-3 sm:-left-6 z-20 max-w-[240px]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0C4B32] to-[#278449] text-white text-xs flex items-center justify-center font-bold shrink-0 shadow-sm">
                    GS
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-[#26352D] truncate">Gurpreet Singh • 32 Ac</p>
                    <p className="text-[11px] text-[#278449] font-semibold leading-tight">
                      Saved 4 tubewell cycles
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.1 ABOUT US SECTION (WHO WE ARE & OUR MISSION)                           */}
      {/* ========================================================================= */}
      <section id="about" className="py-16 sm:py-24 bg-white border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[#E7F3EB] px-3.5 py-1 rounded-full border border-[#C6E2D0]">
                About Khetivo
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0C4B32] tracking-tight leading-snug">
                Built For Farmers, Powered by Agricultural Science &amp; Real Field Data
              </h2>
              <p className="text-sm sm:text-base text-[#55685D] leading-relaxed">
                Khetivo was born with a singular mission: to eliminate agricultural guesswork and equip Indian farmers with an enterprise-grade digital operating system. From family holdings to commercial agro-enterprises, we bridge the gap between PAU agronomy research, live satellite data, and daily field execution.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F4F8F4] border border-[#DCE6DE]">
                  <div className="text-xl font-extrabold text-[#0C4B32]">45,000+</div>
                  <div className="text-xs font-semibold text-[#26352D] mt-0.5">Acres Managed</div>
                  <div className="text-[11px] text-[#55685D] mt-0.5">Across Punjab, Haryana &amp; Rajasthan</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F4F8F4] border border-[#DCE6DE]">
                  <div className="text-xl font-extrabold text-[#278449]">99.8%</div>
                  <div className="text-xs font-semibold text-[#26352D] mt-0.5">Sync Reliability</div>
                  <div className="text-[11px] text-[#55685D] mt-0.5">Offline-first cloud database</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-3xl bg-[#F4F8F4] border border-[#DCE6DE] space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#26352D] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0C4B32]" />
                  <span>The Three Pillars of Khetivo Farm OS</span>
                </h3>

                <div className="space-y-3.5 text-xs text-[#55685D]">
                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E5ECE7]">
                    <div className="w-8 h-8 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-sm text-[#26352D] block font-semibold">100% Data Isolation &amp; Privacy</strong>
                      <span>Every farmer&apos;s parcel boundaries, yield numbers, equipment fleets, and financial invoices remain strictly private and encrypted on cloud databases.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E5ECE7]">
                    <div className="w-8 h-8 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-sm text-[#26352D] block font-semibold">Verified Agronomy Packages</strong>
                      <span>All crop stages, pest alerts, and critical irrigation windows are mapped against Punjab Agricultural University (PAU) and ICAR guidelines.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E5ECE7]">
                    <div className="w-8 h-8 rounded-lg bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-sm text-[#26352D] block font-semibold">Real-Time Farm Weather</strong>
                      <span>Hyper-local weather forecasts accurate to your farm coordinates, alerting you to frost, high winds, and ideal spray hours.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE PROBLEMS SECTION (WHAT INDIAN FARMERS FACE)                        */}
      {/* ========================================================================= */}
      <section id="problems" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-3.5 py-1 rounded-full border border-red-200">
              The Real Ground Reality
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--color-primary)]">
              4 Critical Operational Bottlenecks Solved by Khetivo
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal leading-relaxed">
              Managing a farm without a centralized digital dashboard leads to broken machinery, expired chemical stores, unmonitored field tasks, and untracked mandi revenues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Problem 1 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-red-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Scattered Holdings &amp; Boundary Confusion
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Operating scattered parcels without centralized GPS records leads to uneven fertilizer dosage, incorrect seed calculations, and poor crop rotation tracking.
              </p>
              <div className="text-[11px] font-semibold text-red-700 pt-2 border-t border-red-100 flex items-center gap-1">
                <span>Solved: Multi-Farm GPS Registry &amp; Soil Profiles</span>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-red-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm border border-red-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Unpredicted Weather &amp; Spray Wash-Offs
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Spraying expensive pesticides right before sudden rain or during high winds wastes chemicals, burns plants, and leaves crops completely unprotected.
              </p>
              <div className="text-[11px] font-semibold text-red-700 pt-2 border-t border-red-100 flex items-center gap-1">
                <span>Solved: Live Hyper-Local Weather Radar</span>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-red-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm border border-red-200">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Machinery Breakdowns at Peak Harvest
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Tractors, rotavators, and solar pumps breaking down during peak sowing or harvesting stops operations and causes severe delays and financial losses.
              </p>
              <div className="text-[11px] font-semibold text-red-700 pt-2 border-t border-red-100 flex items-center gap-1">
                <span>Solved: Equipment Tracking &amp; Maintenance Tickets</span>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-red-200 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-sm border border-red-200">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                No Real-Time Profit &amp; Loss Tracking
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Receipts kept in notebooks make it impossible to calculate true net margin per acre or prove financial stability for bank loans and mandi settlements.
              </p>
              <div className="text-[11px] font-semibold text-red-700 pt-2 border-t border-red-100 flex items-center gap-1">
                <span>Solved: Mandi Ledger &amp; Digital Invoicing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE SOLUTIONS SECTION (HOW KHETIVO DASHBOARD SOLVES EACH)              */}
      {/* ========================================================================= */}
      <section id="solutions" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0C4B32] bg-[#E7F3EB] px-3.5 py-1 rounded-full border border-[#C6E2D0]">
              The Khetivo Dashboard Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--color-primary)]">
              Digital Precision Tools Built for Ground Execution
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal leading-relaxed">
              We combined live weather radar, agronomic science, and cloud databases into an intuitive dashboard for everyday farm workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solution 1 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5ECE7] hover:border-[#0C4B32]/50 shadow-xs transition-all space-y-3.5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <CloudSun className="w-6 h-6 text-[#0C4B32]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#26352D]">
                    1. Live Weather Forecasts &amp; GPS Advisory
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55685D] mt-1 leading-relaxed">
                    Access coordinate-level weather radar directly in your dashboard: current temperature, relative humidity, wind velocity, and condition reports. Accurately plan spray windows and irrigation shifts without weather surprises.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                <span>✓ Feature: Live WeatherAPI Integration per Farm GPS</span>
                <span className="text-emerald-700 font-bold">Safe Spray Timing</span>
              </div>
            </div>

            {/* Solution 2 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5ECE7] hover:border-[#0C4B32]/50 shadow-xs transition-all space-y-3.5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <Sprout className="w-6 h-6 text-[#0C4B32]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#26352D]">
                    2. PAU-Aligned Crop Growth Timelines &amp; Packages
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55685D] mt-1 leading-relaxed">
                    Select verified crop master templates for regional varieties (HD-2967, PR-126, Basmati-1509). Track day counts, growth milestones, critical irrigation moisture thresholds, and recommended fungicide applications.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                <span>✓ Feature: Growth Milestones &amp; Critical Stage Alarms</span>
                <span className="text-emerald-700 font-bold">Standardized Yields</span>
              </div>
            </div>

            {/* Solution 3 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5ECE7] hover:border-[#0C4B32]/50 shadow-xs transition-all space-y-3.5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <Calendar className="w-6 h-6 text-[#0C4B32]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#26352D]">
                    3. Interactive Field Tasks &amp; Work Calendar
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55685D] mt-1 leading-relaxed">
                    Create and organize farming operations with due dates, priority tags (Urgent, High, Medium), and assigned staff. Toggle instantly between calendar date agendas and sorted action lists.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                <span>✓ Feature: Task Delegation &amp; Audit Trail</span>
                <span className="text-emerald-700 font-bold">Zero Missed Jobs</span>
              </div>
            </div>

            {/* Solution 4 */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5ECE7] hover:border-[#0C4B32]/50 shadow-xs transition-all space-y-3.5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center shrink-0 border border-[#C6E2D0]">
                  <DollarSign className="w-6 h-6 text-[#0C4B32]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#26352D]">
                    4. Farm Financial Ledger &amp; Mandi Invoicing
                  </h3>
                  <p className="text-xs sm:text-sm text-[#55685D] mt-1 leading-relaxed">
                    Track mandi sales revenue, harvest quantities, and farm expenses directly inside the dashboard. Calculate real-time net margins per acre and generate clean digital invoices.
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
                <span>✓ Feature: Production, Losses &amp; Net Ledger</span>
                <span className="text-emerald-700 font-bold">Clear ROI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CORE PLATFORM FEATURES (ALIGNED WITH FARMER DASHBOARD)                  */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Integrated Farmer Dashboard Modules
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-primary)]">
              The Complete Precision Farming Operating System
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal">
              Every tool in the Khetivo farmer dashboard is designed for ease of use, instant offline access, and cloud sync across your phone and tablet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Multi-Farm & GPS Management */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <MapPin className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Multi-Holding Farm &amp; GPS Registry
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Add and switch between multiple farm parcels (e.g. Ludhiana, Sangrur, Bathinda). Record total area in Acres, Bigha, or Hectares, define soil types, irrigation sources, and boundary coordinates.
              </p>
            </div>

            {/* Feature 2: Real-time Weather Radar */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <CloudSun className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Hyper-Local Weather &amp; Spray Advisory
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Live coordinate-based temperature, humidity, wind velocity, and 3-day precipitation forecasts. Know the exact safe window to apply fertilizer and spray pesticides without wash-off risk.
              </p>
            </div>

            {/* Feature 3: Crop Life-Cycle & PAU Timeline */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <Sprout className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Crop Master &amp; Growth Timelines
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Pre-configured PAU crop templates for Wheat (HD-2967, PBW-343), Paddy (PR-126, Basmati-1509), and Cotton. Track sowing age, vegetative stage, critical irrigation windows, and target yield quintals.
              </p>
            </div>

            {/* Feature 4: Field Tasks & Delegation */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <Calendar className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Field Operations &amp; Task Scheduler
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Schedule irrigation shifts, foliar spraying, and harvesting tasks. Switch between interactive Calendar and List views with status badges (Pending, In Progress, Completed).
              </p>
            </div>

            {/* Feature 5: Inventory & Warehouse Stores */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <Package className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Store Inventory &amp; Expiry Alerts
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Track warehouse stock for Seeds, Urea/DAP, Pesticides, and Fuel. Monitor re-order thresholds, record dosage usage by crop parcel, and prevent expired chemical usage.
              </p>
            </div>

            {/* Feature 6: Equipment Fleet & Maintenance */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <Wrench className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Equipment Fleet &amp; Problem Reports
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Track machinery (Tractors, Rotavators, Solar Pumps, Combine Harvesters) tied directly to specific farms. Log operating hours, service due reminders, and submit emergency repair tickets.
              </p>
            </div>

            {/* Feature 7: Farm Financials & Mandi Ledger */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <DollarSign className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Financial Ledger &amp; P&amp;L Statements
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                Record production harvest sales, input expenses, and mandi dispatches. Real-time net margin calculation, invoice generation, and printable harvest profit/loss reports.
              </p>
            </div>

            {/* Feature 8: Agronomy Advisories & Support */}
            <div className="card-base p-6 space-y-3 bg-white">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center font-bold text-sm">
                <Radio className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                University Bulletins &amp; Field Visits
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-normal leading-relaxed">
                District-specific bulletins on yellow rust, pink bollworm, and fertilizer dosages. Request on-site field visits from agronomists with GPS-tagged inspection reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. INTERACTIVE FARM ROI CALCULATOR                                        */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Interactive ROI
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
              Calculate Your Estimated Savings &amp; Profit Boost
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] font-normal">
              Based on empirical field trials conducted with over 45,000 acres in Punjab, Haryana, and Rajasthan.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Inputs */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#26352D] mb-1.5">
                    <span>Your Total Farm Land</span>
                    <span className="text-[#0C4B32] font-bold text-sm">{farmAcres} Acres</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={100}
                    step={1}
                    value={farmAcres}
                    onChange={(e) => setFarmAcres(Number(e.target.value))}
                    className="w-full accent-[#0C4B32] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#889B90] mt-1">
                    <span>2 Acres</span>
                    <span>50 Acres</span>
                    <span>100 Acres</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1.5">
                    Primary Crop Season
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FBFDFB] border border-[#DCE6DE] rounded-xl outline-none text-[#26352D] font-medium cursor-pointer"
                  >
                    <option value="Wheat & Paddy">Wheat &amp; Paddy (Rice)</option>
                    <option value="Mustard & Barley">Mustard &amp; Barley</option>
                    <option value="Bt Cotton & Maize">Bt Cotton &amp; Maize</option>
                    <option value="Sugarcane & Fodder">Sugarcane &amp; Dairy Fodder</option>
                    <option value="Potato & Vegetables">Potato &amp; Commercial Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26352D] mb-1.5">
                    Existing Irrigation Setup
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FBFDFB] border border-[#DCE6DE] rounded-xl outline-none text-[#26352D] font-medium cursor-pointer"
                  >
                    <option value="Tubewell / Flood">Tubewell / Flood Irrigation</option>
                    <option value="Canal + Borewell">Canal Water + Diesel Generator</option>
                    <option value="Drip / Sprinkler">Drip / Micro-Irrigation System</option>
                  </select>
                </div>
              </div>

              {/* Output Results Card */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0C4B32] text-white space-y-4 shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Projected Annual Gain for {farmAcres} Acres
                </span>

                <div className="text-3xl sm:text-4xl font-extrabold text-[#F9B21B]">
                  ₹{totalNetGain.toLocaleString("en-IN")} <span className="text-sm font-normal text-white/80">/ Year</span>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/20 text-xs text-white/90">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Water &amp; Power Saved:</span>
                    </span>
                    <strong className="text-white font-mono">{estimatedWaterSaved.toLocaleString("en-IN")} Liters</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/80 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved in Diesel &amp; Fertilizer:</span>
                    </span>
                    <strong className="text-white font-mono">₹{estimatedInputSaved.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/80 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Additional Yield Revenue:</span>
                    </span>
                    <strong className="text-[#F9B21B] font-mono">₹{estimatedYieldBoost.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDemoSubmitted(false);
                    setDemoModalOpen(true);
                  }}
                  className="w-full mt-2 py-3 rounded-xl bg-[#F9B21B] hover:bg-[#e5a015] text-[#26352D] font-bold text-xs transition-colors cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span>Verify These Numbers for Your Land</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. HOW IT WORKS (3 SIMPLE STEPS)                                          */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Quick Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
              How the Farmer Dashboard Works in 3 Steps
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal">
              Get your whole farm digitized, monitored, and running scientifically in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-[var(--color-border)] shadow-xs relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0C4B32] text-white text-sm font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Register Your Holdings &amp; Equipment
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Add farm holdings (e.g. Ludhiana, Bathinda) with acreage, soil type, and irrigation source. Link your machinery fleet (tractors, rotavators, solar pumps) to your specific parcels.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-[var(--color-border)] shadow-xs relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#278449] text-white text-sm font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Assign Crops &amp; Operational Tasks
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Add crops from PAU master templates with pre-configured growth timelines. Schedule irrigation, fertilization, and spraying tasks in the interactive field calendar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[var(--radius-card)] bg-white border border-[var(--color-border)] shadow-xs relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0C4B32] text-white text-sm font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-[#26352D]">
                Track Weather, Stocks &amp; Mandi Ledger
              </h3>
              <p className="text-xs text-[#55685D] leading-relaxed">
                Monitor live weather radar, manage warehouse fertilizer/seed stocks, record crop sales, and generate digital profit &amp; loss statements with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. OUR AGRONOMY & SCIENTIFIC TEAM (OUR TEAM)                             */}
      {/* ========================================================================= */}
      <section id="team" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Scientific Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
              Backed by Senior Agronomists &amp; Agricultural Scientists
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal">
              Every package of practices, disease advisory, and soil threshold in Khetivo is reviewed by certified university crop scientists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Team Member 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-bold text-lg flex items-center justify-center mx-auto border-2 border-[#C6E2D0]">
                DA
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26352D]">Dr. Amanpreet Singh</h3>
                <p className="text-[11px] font-semibold text-[#0C4B32]">Chief Agronomist</p>
                <p className="text-[10px] text-[#889B90] mt-1">Ex-PAU Agronomy Lead • 22+ Yrs Experience in Rabi &amp; Kharif Crops</p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-bold text-lg flex items-center justify-center mx-auto border-2 border-[#C6E2D0]">
                DH
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26352D]">Dr. Harpreet Singh</h3>
                <p className="text-[11px] font-semibold text-[#0C4B32]">Senior Crop Pathologist</p>
                <p className="text-[10px] text-[#889B90] mt-1">Specialist in Foliar Blights, Yellow Rust &amp; Bio-Fungicide Formulations</p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-bold text-lg flex items-center justify-center mx-auto border-2 border-[#C6E2D0]">
                ES
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26352D]">Er. Sukhwinder Brar</h3>
                <p className="text-[11px] font-semibold text-[#0C4B32]">Head of Agri-IoT Hardware</p>
                <p className="text-[10px] text-[#889B90] mt-1">Wireless Soil Moisture Probes &amp; Rural Sensor Networks</p>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5ECE7] text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E7F3EB] text-[#0C4B32] font-bold text-lg flex items-center justify-center mx-auto border-2 border-[#C6E2D0]">
                ND
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#26352D]">Navjot Dhillon, M.Sc.</h3>
                <p className="text-[11px] font-semibold text-[#0C4B32]">Field Extension Lead</p>
                <p className="text-[10px] text-[#889B90] mt-1">Village Demonstration Officer &amp; Progressive Farmer Trainer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. REAL FARMER TESTIMONIALS (AUTO-SLIDER & SYNCED SPOTLIGHT)            */}
      {/* ========================================================================= */}
      <section id="testimonials" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Real Impact
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
              Trusted by Progressive Farmers Across 9 States
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-normal">
              Read how growers reduced electricity and diesel expenses while capturing record mandi prices.
            </p>
          </div>

          {/* Featured Farmer Spotlight Card with Tractor Photo (Synced with Auto-Slider) */}
          {(() => {
            const activeTestimonial = testimonialsList[activeTestimonialIndex] || testimonialsList[0];
            return (
              <div className="mb-12 bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm overflow-hidden transition-all duration-700 ease-in-out">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] bg-[#F4F8F4]">
                    <div
                      key={`img-${activeTestimonial.id}`}
                      className="transition-all duration-700 ease-out transform animate-in fade-in zoom-in-95"
                    >
                      <Image
                        src={activeTestimonial.image}
                        alt={activeTestimonial.name}
                        width={480}
                        height={360}
                        className="w-full h-64 sm:h-72 object-cover"
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-[#DCE6DE] flex items-center justify-between shadow-md transition-all duration-500">
                      <div className="flex items-center gap-2">
                        <Image src="/khetivo-app-icon.png" alt="Khetivo" width={22} height={22} className="rounded" />
                        <div>
                          <div className="text-xs font-bold text-[#26352D]">{activeTestimonial.name}</div>
                          <div className="text-[10px] text-[#55685D]">{activeTestimonial.location}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {activeTestimonial.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    key={`content-${activeTestimonial.id}`}
                    className="lg:col-span-7 space-y-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-right-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1 text-[var(--color-accent)]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[var(--color-accent)]" />
                        ))}
                        <span className="text-xs font-bold text-[#26352D] ml-2">5.0 Star Verified Farmer Review</span>
                      </div>

                      {/* Slider Dots Indicator */}
                      <div className="flex items-center gap-1.5">
                        {testimonialsList.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActiveTestimonialIndex(dotIdx)}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                              dotIdx === activeTestimonialIndex
                                ? "w-7 bg-[#0C4B32]"
                                : "w-2 bg-[#DCE6DE] hover:bg-[#889B90]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-base sm:text-lg text-[#26352D] font-medium leading-relaxed italic min-h-[90px] sm:min-h-[80px] flex items-center">
                      &ldquo;{activeTestimonial.quote}&rdquo;
                    </blockquote>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border)] text-xs">
                      <div className="transition-all duration-500">
                        <div className="text-lg font-bold text-[#0C4B32]">{activeTestimonial.metric1Val}</div>
                        <div className="text-[11px] text-[#55685D]">{activeTestimonial.metric1Lbl}</div>
                      </div>
                      <div className="transition-all duration-500">
                        <div className="text-lg font-bold text-[#0C4B32]">{activeTestimonial.metric2Val}</div>
                        <div className="text-[11px] text-[#55685D]">{activeTestimonial.metric2Lbl}</div>
                      </div>
                      <div className="transition-all duration-500">
                        <div className="text-lg font-bold text-[#0C4B32]">{activeTestimonial.metric3Val}</div>
                        <div className="text-[11px] text-[#55685D]">{activeTestimonial.metric3Lbl}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bottom Review Cards Slider (One by One Auto-Slide and Clickable to Highlight on Top) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonialsList.map((item, idx) => {
              const isActive = idx === activeTestimonialIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTestimonialIndex(idx)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                    isActive
                      ? "bg-white border-[#0C4B32] shadow-md ring-2 ring-[#0C4B32]/30 scale-[1.02]"
                      : "bg-white/80 border-[#E5ECE7] hover:border-[#A7D7B8] hover:bg-white shadow-xs opacity-85 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1 text-[var(--color-accent)]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[var(--color-accent)]" />
                        ))}
                      </div>
                      {isActive && (
                        <span className="text-[9px] font-bold text-[#0C4B32] bg-[#E7F3EB] px-2 py-0.5 rounded-full animate-pulse">
                          Active Top
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#26352D] font-normal leading-relaxed italic line-clamp-3 mb-4">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5ECE7] flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${item.avatarBg} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#26352D] truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#55685D] truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#0C4B32] shrink-0" />
                        <span className="truncate">{item.location.split("•")[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. MOBILE APP DOWNLOAD SECTION (PHONE SHOWS ONLY THE ICON)              */}
      {/* ========================================================================= */}
      <section id="download" className="py-10 sm:py-14 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="bg-[#0C4B32] text-white rounded-[32px] p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#278449]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
                  <Smartphone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Free Download on Android &amp; iOS
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-white tracking-tight leading-snug">
                  Carry Your Entire Farm in Your Pocket.
                </h2>

                <p className="text-white/80 text-xs sm:text-sm font-normal max-w-2xl leading-relaxed">
                  Engineered specifically for low-connectivity rural belts. Works 100% offline, recognizes voice commands in Punjabi, Hindi, and 10 regional dialects, and syncs automatically when you return to Wi-Fi or 4G.
                </p>

                {/* Feature Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-white/90 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span className="text-[11px] sm:text-xs">100% Offline Diagnosis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span className="text-[11px] sm:text-xs">Daily SMS &amp; Weather Alerts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span className="text-[11px] sm:text-xs">Voice in Punjabi &amp; Hindi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span className="text-[11px] sm:text-xs">Minimal Battery Drain</span>
                  </div>
                </div>

                {/* SMS Link Form */}
                <div className="pt-2">
                  <p className="text-xs text-white/80 mb-2 font-medium">
                    Send free app download link directly to your mobile phone:
                  </p>
                  {smsSent ? (
                    <div className="p-2.5 bg-white/10 border border-[#86EFAC]/40 rounded-xl text-xs text-[#86EFAC] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Download link sent successfully to +91 {phoneForSms}. Check your SMS!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSmsDownload} className="flex flex-col sm:flex-row gap-2 max-w-md">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#55685D] font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={phoneForSms}
                          onChange={(e) => setPhoneForSms(e.target.value)}
                          className="w-full pl-11 pr-3 py-2 text-xs text-[#26352D] bg-white rounded-xl border border-white/20 focus:outline-none"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-accent text-xs px-4 py-2 shrink-0 font-bold"
                      >
                        Send App Link
                      </button>
                    </form>
                  )}
                </div>

                {/* App store buttons with authentic icons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* Google Play Store Badge */}
                  <a
                    href="#download"
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black hover:bg-black/80 border border-white/20 transition-all shadow-md group cursor-pointer"
                  >
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3.6 1.48C3.36 1.73 3.2 2.13 3.2 2.67V21.33C3.2 21.87 3.36 22.27 3.6 22.52L3.68 22.6L14.04 12.24V11.76L3.68 1.4L3.6 1.48Z"
                        fill="#00E676"
                      />
                      <path
                        d="M17.48 15.69L14.04 12.25V11.75L17.48 8.31L17.57 8.36L21.65 10.68C22.81 11.34 22.81 12.42 21.65 13.08L17.57 15.4L17.48 15.69Z"
                        fill="#FFD600"
                      />
                      <path
                        d="M17.57 15.39L14.04 11.86L3.6 22.3C4.01 22.73 4.69 22.79 5.48 22.34L17.57 15.39Z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M17.57 8.37L5.48 1.42C4.69 0.97 4.01 1.03 3.6 1.46L14.04 11.9L17.57 8.37Z"
                        fill="#00B0FF"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase tracking-wider text-white/70 font-medium leading-none">GET IT ON</div>
                      <div className="text-xs font-bold text-white leading-tight mt-0.5">Google Play</div>
                    </div>
                  </a>

                  {/* Apple App Store Badge */}
                  <a
                    href="#download"
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-black hover:bg-black/80 border border-white/20 transition-all shadow-md group cursor-pointer"
                  >
                    <svg className="w-6 h-6 shrink-0 fill-white" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.61 1.34-.56.64-1.05 1.7-0.92 2.73 1.01.08 2-.48 2.61-1.22z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] uppercase tracking-wider text-white/70 font-medium leading-none">Download on the</div>
                      <div className="text-xs font-bold text-white leading-tight mt-0.5">App Store</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right: Phone Frame with Authentic Real Smartphone Aspect Ratio (19.5:9) */}
              <div className="lg:col-span-4 flex justify-center py-2">
                <div className="relative w-[210px] sm:w-[230px] aspect-[9/19] bg-[#0A1A12] rounded-[42px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[3px] border-[#2A593F] ring-1 ring-white/20">
                  {/* Outer Frame Edge Accents */}
                  <div className="absolute -left-[5px] top-24 w-[3px] h-7 bg-[#2A593F] rounded-l" />
                  <div className="absolute -left-[5px] top-34 w-[3px] h-10 bg-[#2A593F] rounded-l" />
                  <div className="absolute -left-[5px] top-47 w-[3px] h-10 bg-[#2A593F] rounded-l" />
                  <div className="absolute -right-[5px] top-28 w-[3px] h-12 bg-[#2A593F] rounded-r" />

                  {/* Inner Screen */}
                  <div className="w-full h-full bg-gradient-to-b from-[#083523] via-[#0C4B32] to-[#083523] rounded-[34px] overflow-hidden flex flex-col justify-between p-3.5 relative shadow-inner">
                    {/* Top Status Bar & Dynamic Island */}
                    <div className="flex items-center justify-between text-[9px] text-white/80 px-2 pt-0.5">
                      <span className="font-semibold font-mono">9:41</span>
                      <div className="w-20 h-4 bg-black/80 rounded-full flex items-center justify-end px-2 border border-white/10 shadow-xs">
                        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[8px]">
                        <span>5G</span>
                        <div className="w-3.5 h-1.5 border border-white/70 rounded-xs p-[0.5px]">
                          <div className="bg-white h-full w-[80%]" />
                        </div>
                      </div>
                    </div>

                    {/* Centered App Showcase Content */}
                    <div className="my-auto flex flex-col items-center justify-center text-center space-y-3">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#278449]/40 to-[#F9B21B]/30 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
                        <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-[22px] overflow-hidden shadow-2xl border-2 border-white/40 transform transition-transform duration-300 hover:scale-105 bg-[#0C4B32]">
                          <Image
                            src="/khetivo-app-icon.png"
                            alt="Khetivo App"
                            width={104}
                            height={104}
                            className="w-full h-full object-cover"
                            priority
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-white text-sm font-bold tracking-wide">Khetivo Mobile</div>
                        <div className="text-[#86EFAC] text-[11px] font-semibold mt-0.5">Farmer Operating System</div>
                        <div className="text-white/60 text-[9px] mt-1 font-mono">Offline • GPS Sync • PAU Prescriptions</div>
                      </div>
                    </div>

                    {/* Bottom Home Indicator Bar */}
                    <div className="pt-2 flex justify-center">
                      <div className="w-24 h-1 bg-white/40 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FAQ ACCORDION                                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
              Frequently Asked Farmer Questions
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] font-normal">
              Clear, transparent answers about how Khetivo operates on real Indian farms.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "What modules are included in the Khetivo Farmer Dashboard?",
                a: "The dashboard integrates 8 core modules: Multi-Holding Farm GPS Registry, Live Weather Radar (coordinates, wind, rain forecasts), Crop Growth Timelines (PAU varieties), Interactive Task Scheduler (Calendar & List view), Store Warehouse Inventory & Expiry Tracking, Equipment & Fleet Maintenance Log, Farm P&L Mandi Ledger, and University Advisories.",
              },
              {
                q: "Is my farm data private from other farmers and buyers?",
                a: "Yes, 100%. Khetivo enforces rigorous multi-tenant data isolation on Appwrite Cloud. Each farmer's land coordinates, crop yields, warehouse stores, equipment machinery, and financial invoices are isolated to their personal account and never shared with other users or commission agents.",
              },
              {
                q: "How does the Live Weather Radar work?",
                a: "The dashboard connects directly to live WeatherAPI using your farm's GPS coordinates (e.g. Ludhiana, Bathinda, Sangrur). It provides real-time ambient temperature, relative humidity, wind speed & direction, and 3-day precipitation forecasts to prevent chemical spray wash-offs and frost damage.",
              },
              {
                q: "Can I manage multiple farm parcels and machinery fleets?",
                a: "Yes. You can register multiple distinct farm holdings with customized land units (Acres, Killa, Bigha, or Hectares). You can also tie equipment (tractors, rotavators, solar pumps) directly to individual holdings, log operational hours, and file maintenance issue tickets.",
              },
              {
                q: "Which crops are pre-configured in the Crop Master?",
                a: "Khetivo includes university-verified crop packages for Wheat (HD-2967, PBW-343, PBW-826), Paddy (PR-126, Basmati-1509), Bt Cotton, Mustard, and Green Fodder, with full growth timelines from sowing to physiological maturity.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--color-border)] bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#26352D] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#889B90] transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-[#0C4B32]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#55685D] leading-relaxed border-t border-[#E5ECE7] pt-3 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. CONTACT HELPLINE & FIELD DEMO DESK                                    */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 sm:py-24 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Helpline Info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0C4B32] bg-[#E7F3EB] px-3.5 py-1 rounded-full border border-[#C6E2D0]">
                Farmer Support Desk
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--color-primary)]">
                Talk to a PAU-Trained Agronomist Today
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] font-normal leading-relaxed">
                Have questions about your soil type, persistent leaf rust, or scheduling a free on-field demo? Our duty agronomists are available 7 days a week.
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E5ECE7]">
                  <div className="p-2.5 rounded-xl bg-[#E7F3EB] text-[#0C4B32] shrink-0">
                    <PhoneCall className="w-5 h-5 text-[#0C4B32]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#26352D] text-sm">Toll-Free Farmer Advisory Helpline</div>
                    <div className="text-xs font-mono font-bold text-[#0C4B32] mt-0.5">1800-889-KHETI (Toll-Free)</div>
                    <div className="text-[11px] text-[#889B90] mt-0.5">Monday to Saturday: 7:00 AM – 7:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-[#E5ECE7]">
                  <div className="p-2.5 rounded-xl bg-[#E7F3EB] text-[#0C4B32] shrink-0">
                    <MessageSquare className="w-5 h-5 text-[#0C4B32]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#26352D] text-sm">WhatsApp Agronomy Support</div>
                    <div className="text-xs font-mono font-bold text-[#0C4B32] mt-0.5">+91 98140-54321</div>
                    <div className="text-[11px] text-[#889B90] mt-0.5">Instant leaf photo analysis &amp; mandi alerts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E5ECE7] shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-[#26352D] mb-1">
                Send an Agronomy Query or Request a Callback
              </h3>
              <p className="text-xs text-[#55685D] mb-5">
                Our regional field agronomist will call you back within 2 hours.
              </p>

              {contactSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-950">Thank You, Query Received!</h4>
                  <p className="text-xs text-emerald-800">
                    Our duty agronomist will review your details and contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jaswinder Singh"
                        className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Mobile Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98140-54321"
                        className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        District / State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ludhiana, Punjab"
                        className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                        Primary Crop Grown
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Wheat, Basmati Rice, Mustard"
                        className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Your Query or Farm Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your soil type, crops, or irrigation setup..."
                      className="w-full px-3.5 py-2.5 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full py-3 text-xs font-semibold justify-center shadow-xs cursor-pointer"
                  >
                    Submit Query to Duty Agronomist
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="bg-[#0C4B32] text-white border-t border-white/10 pt-14 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/15">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Image
                src="/logo-2-khetivo.png"
                alt="Khetivo"
                width={200}
                height={60}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
              <p className="text-white/80 max-w-sm leading-relaxed text-xs">
                Khetivo is India&apos;s premier Precision Agriculture Operating System, connecting IoT sensors, satellite NDVI scans, and AI pathology diagnostics to empower farmers toward higher yields and sustainable prosperity.
              </p>
              <div className="flex items-center gap-3 pt-1 text-white/80">
                <span>Made with pride for Indian Farmers 🌾</span>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div className="space-y-3">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                Solutions
              </div>
              <ul className="space-y-2 text-white/80">
                <li><a href="#solutions" className="hover:text-white transition-colors">Precision Soil Moisture</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">AI Leaf Disease Scanner</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Live APMC Mandi Watch</a></li>
                <li><a href="#solutions" className="hover:text-white transition-colors">Satellite Crop Health</a></li>
                <li><a href="#calculator" className="hover:text-white transition-colors">Farm ROI Calculator</a></li>
              </ul>
            </div>

            {/* Col 3: Company & Team */}
            <div className="space-y-3">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                Company
              </div>
              <ul className="space-y-2 text-white/80">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Farmer OS Features</a></li>
                <li><a href="#team" className="hover:text-white transition-colors">Agronomy &amp; Science Team</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Farmer Testimonials</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Farmer Dashboard</Link></li>
              </ul>
            </div>

            {/* Col 4: State Networks */}
            <div className="space-y-3">
              <div className="font-bold text-white text-xs uppercase tracking-wider">
                Active States
              </div>
              <ul className="space-y-1.5 text-white/80 text-[11px]">
                <li>Punjab (Ludhiana, Moga, Bathinda)</li>
                <li>Haryana (Karnal, Sirsa, Hisar)</li>
                <li>Rajasthan (Sri Ganganagar, Kota)</li>
                <li>Madhya Pradesh (Hoshangabad, Ujjain)</li>
                <li>Maharashtra (Jalgaon, Nashik)</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/70 text-[11px]">
            <div>
              © 2026 Khetivo Technologies Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-white transition-colors">Farmer Support Desk</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST A FIELD DEMO MODAL                                       */}
      {/* ========================================================================= */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DCE6DE] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">
                  Request a Free On-Field Demo
                </h3>
                <p className="text-[11px] text-[#55685D] mt-0.5">
                  Our regional field agronomist will visit your land with soil test probes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {demoSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">Field Demo Scheduled!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you! Our regional agronomy specialist will call you to confirm your date and farm plot location.
                </p>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(false)}
                  className="btn btn-primary text-xs px-5 py-2 font-medium cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Farmer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaswinder Singh"
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98140-54321"
                    value={demoForm.phone}
                    onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Farm Land Area
                    </label>
                    <select
                      value={demoForm.acres}
                      onChange={(e) => setDemoForm({ ...demoForm, acres: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="2-10">2 – 10 Acres</option>
                      <option value="10-25">10 – 25 Acres</option>
                      <option value="25-50">25 – 50 Acres</option>
                      <option value="50+">50+ Acres (FPO / Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      State / District
                    </label>
                    <select
                      value={demoForm.state}
                      onChange={(e) => setDemoForm({ ...demoForm, state: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D] cursor-pointer"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn btn-primary py-2.5 text-xs justify-center font-bold shadow-xs cursor-pointer"
                >
                  Confirm Free Demo Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SIGN IN / SIGN UP AUTH MODAL                                     */}
      {/* ========================================================================= */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DCE6DE] shadow-2xl max-w-md w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#26352D]">
                  {authSuccess
                    ? "Welcome to Khetivo"
                    : authStep === "google_phone"
                    ? "Verify Mobile Phone"
                    : authStep === "otp"
                    ? "Enter Verification Code"
                    : authMode === "signin"
                    ? "Sign In to Khetivo"
                    : "Create Your Khetivo Account"}
                </h3>
                <p className="text-[11px] text-[#55685D] mt-0.5">
                  {authSuccess
                    ? "Authentication successful"
                    : authStep === "google_phone"
                    ? "1-time mobile verification required for farm alerts"
                    : authStep === "otp"
                    ? "Single-use OTP verification for your security"
                    : authMode === "signin"
                    ? "Access your farm dashboard, sensors, and records"
                    : "Start your 14-day free trial on your land"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthModalOpen(false);
                  setAuthSuccess(false);
                  setAuthStep("form");
                  setAuthPhoneError("");
                  setAlreadyVerifiedNotice(false);
                }}
                className="p-1.5 text-[#889B90] hover:text-[#26352D] rounded-xl hover:bg-[#F4F8F4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SUCCESS STATE */}
            {authSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center mx-auto border border-[#C6E2D0]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#26352D]">Verification Successful</h4>
                  <p className="text-[11px] text-[#55685D] mt-1 max-w-xs mx-auto">
                    {authSuccessMsg || "Redirecting to your Khetivo Farm Operations Dashboard..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(false);
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary py-2 px-5 text-xs font-semibold rounded-xl"
                >
                  Go to Dashboard →
                </button>
              </div>
            ) : authStep === "google_phone" ? (
              /* GOOGLE USER PHONE NUMBER STEP (OTP required) */
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE]">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="font-semibold text-[#26352D] truncate">farmer.jaswinder@gmail.com</span>
                  <span className="ml-auto text-[10px] text-[#0C4B32] font-bold bg-[#E7F3EB] px-2 py-0.5 rounded-full">
                    Connected
                  </span>
                </div>

                <p className="text-[11px] text-[#55685D] leading-relaxed">
                  To complete your account creation, mobile number OTP verification is required. Each user can only verify once.
                </p>

                {alreadyVerifiedNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <strong>Already Verified:</strong> This phone number has already been verified for an existing user. The OTP is only verified for one time not multiple times.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setAuthStep("form");
                        setAlreadyVerifiedNotice(false);
                        setAuthPhoneError("");
                      }}
                      className="w-full py-1.5 px-3 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold hover:bg-amber-100 transition-colors text-center cursor-pointer"
                    >
                      Sign In with this Number →
                    </button>
                  </div>
                )}

                <form onSubmit={handleGooglePhoneSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                      Mobile Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl text-[#55685D] font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98140-54321"
                        value={authPhone}
                        onChange={(e) => {
                          setAuthPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setAuthPhoneError("");
                          setAlreadyVerifiedNotice(false);
                        }}
                        className="flex-1 px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                      />
                    </div>
                    {authPhoneError && !alreadyVerifiedNotice && (
                      <p className="text-red-600 text-[10px] mt-1 font-medium">{authPhoneError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full btn btn-primary py-2.5 text-xs justify-center font-bold shadow-xs cursor-pointer"
                  >
                    {authLoading ? "Sending OTP..." : "Get OTP Verification Code"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep("form");
                        setAuthPhoneError("");
                        setAlreadyVerifiedNotice(false);
                      }}
                      className="text-[#55685D] hover:text-[#26352D] text-[11px] font-medium cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                  </div>
                </form>
              </div>
            ) : authStep === "otp" ? (
              /* REAL OTP VERIFICATION STEP (STRICTLY FOR SIGNUP USERS - ONE TIME PROCESS) */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#E7F3EB] text-[#0C4B32] flex items-center justify-center mx-auto border border-[#C6E2D0] mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-[#55685D]">
                    We sent a 6-digit verification code via SMS to
                  </p>
                  <p className="text-sm font-bold text-[#0C4B32] font-mono">
                    +91 {authPhone || "98140-54321"}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F4F8F4] border border-[#DCE6DE] text-center text-[11px] text-[#55685D]">
                  🛡️ <strong>One-Time Verification Process:</strong> This verification is required only once for signup. Existing signin users do not need OTP.
                </div>

                <div className="flex justify-center gap-2">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`auth-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      autoFocus={idx === 0}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-bold bg-[#FBFDFB] border border-[#DCE6DE] rounded-xl focus:border-[#0C4B32] outline-none text-[#26352D]"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-center">
                    <p className="text-[11px] text-red-600 font-semibold">{otpError}</p>
                    {alreadyVerifiedNotice && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setAuthStep("form");
                          setOtpError("");
                        }}
                        className="mt-1.5 text-[10px] font-bold text-[#0C4B32] hover:underline cursor-pointer block mx-auto"
                      >
                        Switch to Direct Sign In →
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full btn btn-primary py-2.5 text-xs justify-center font-bold shadow-xs cursor-pointer"
                >
                  {authLoading ? "Verifying OTP..." : "Verify & Activate Khetivo Account"}
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#55685D]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep("form");
                      setOtpError("");
                    }}
                    className="hover:text-[#26352D] cursor-pointer"
                  >
                    ← Change Number
                  </button>

                  {otpTimer > 0 ? (
                    <span>
                      Resend in <strong className="text-[#0C4B32]">{otpTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-[#0C4B32] hover:underline cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            ) : (
              /* STANDARD FORM: SIGN IN (DIRECT, NO OTP) OR SIGN UP (REAL 1-TIME OTP) */
              <div className="space-y-3.5">
                {/* 1. GOOGLE AUTH BUTTON */}
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={authLoading}
                  className="w-full py-2.5 px-3 bg-white hover:bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl font-semibold text-[#26352D] text-xs flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{authMode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
                </button>

                {/* 2. OR DIVIDER */}
                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full border-t border-[#E5ECE7]" />
                  <span className="bg-white px-2.5 text-[10px] uppercase tracking-wider text-[#889B90] font-semibold">
                    {authMode === "signin" ? "or sign in with credentials" : "or register with mobile & email"}
                  </span>
                </div>

                {/* 3. ALREADY VERIFIED NOTIFICATION BANNER */}
                {alreadyVerifiedNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-snug">
                        <strong>User Already Verified:</strong> This mobile number has already completed one-time OTP verification. OTP is strictly for signup, not signin. Please sign in directly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setAlreadyVerifiedNotice(false);
                        setAuthPhoneError("");
                      }}
                      className="w-full py-1.5 px-3 bg-white border border-amber-300 rounded-lg text-amber-900 font-bold hover:bg-amber-100 transition-colors text-center cursor-pointer"
                    >
                      Sign In Directly to Account →
                    </button>
                  </div>
                )}

                {/* 4. FORM BODY */}
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {/* SIGN UP FORM (REAL OTP REQUIRED - ONE TIME PROCESS) */}
                  {authMode === "signup" ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jaswinder Singh"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-[#26352D]">
                            Mobile Phone Number
                          </label>
                          <span className="text-[10px] text-[#0C4B32] font-semibold">
                            * 1-Time Real OTP Required
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl text-[#55685D] font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="98140-54321"
                            value={authPhone}
                            onChange={(e) => {
                              setAuthPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                              setAuthPhoneError("");
                              setAlreadyVerifiedNotice(false);
                            }}
                            className="flex-1 px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                        </div>
                        {authPhoneError && !alreadyVerifiedNotice && (
                          <p className="text-red-600 text-[10px] mt-1 font-medium">{authPhoneError}</p>
                        )}
                      </div>

                      {/* INLINE OTP VERIFICATION CODE FIELD (Appears right after contact number and before Gmail/Email) */}
                      {sanitizePhone(authPhone).length === 10 && !alreadyVerifiedNotice && (
                        <div className="p-3 bg-[#F4F8F4] border border-[#DCE6DE] rounded-xl space-y-2.5 transition-all">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-[#26352D] flex items-center gap-1.5">
                              <span>Enter 6-Digit Verification Code</span>
                              {authLoading && (
                                <span className="text-[10px] text-[#0C4B32] font-normal animate-pulse">
                                  (Sending OTP...)
                                </span>
                              )}
                            </label>
                            {otpTimer > 0 ? (
                              <span className="text-[10px] text-[#55685D]">
                                Resend in <strong className="text-[#0C4B32] font-bold">{otpTimer}s</strong>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-[10px] font-bold text-[#0C4B32] hover:underline cursor-pointer"
                              >
                                Resend Code
                              </button>
                            )}
                          </div>

                          <div className="flex justify-between gap-1.5">
                            {otpValues.map((digit, i) => (
                              <input
                                key={`inline-${i}`}
                                id={`auth-otp-inline-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInlineOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleInlineOtpKeyDown(i, e)}
                                className="w-10 h-11 text-center text-base font-bold bg-white rounded-lg border border-[#DCE6DE] focus:border-[#0C4B32] focus:ring-1 focus:ring-[#0C4B32] outline-none text-[#26352D]"
                              />
                            ))}
                          </div>

                          {otpError && (
                            <p className="text-red-600 text-[10px] font-medium">{otpError}</p>
                          )}
                          <p className="text-[10px] text-[#55685D] leading-tight">
                            SMS sent to <span className="font-semibold text-[#26352D]">+91 {sanitizePhone(authPhone)}</span>. OTP is valid for 10 minutes.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Gmail / Email ID
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. jaswinder@gmail.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Account Password
                        </label>
                        <div className="relative">
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            required
                            placeholder="Create account password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full px-3 py-2 pr-9 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#889B90] hover:text-[#26352D]"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full btn btn-primary py-2.5 text-xs justify-center font-bold shadow-xs cursor-pointer"
                      >
                        {authLoading
                          ? "Processing..."
                          : sanitizePhone(authPhone).length === 10
                          ? "Verify & Create Account"
                          : "Create Account"}
                      </button>
                    </>
                  ) : (
                    /* SIGN IN FORM (DIRECT CREDENTIALS LOGIN - NO OTP FOR SIGNIN USERS!) */
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#26352D] mb-1">
                          Mobile Phone, Gmail, or Farmer ID
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 98140-54321, farmer@gmail.com or KHET-98140"
                          value={authIdentifier}
                          onChange={(e) => {
                            setAuthIdentifier(e.target.value);
                            setAuthPhoneError("");
                          }}
                          className="w-full px-3 py-2 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-semibold text-[#26352D]">
                            Password
                          </label>
                          <a
                            href="#forgot"
                            onClick={(e) => {
                              e.preventDefault();
                              alert("Password reset instructions will be sent to your registered contact.");
                            }}
                            className="text-[10px] text-[#0C4B32] hover:underline"
                          >
                            Forgot?
                          </a>
                        </div>
                        <div className="relative">
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={authPassword}
                            onChange={(e) => {
                              setAuthPassword(e.target.value);
                              setAuthPhoneError("");
                            }}
                            className="w-full px-3 py-2 pr-9 bg-[#FBFDFB] rounded-xl border border-[#DCE6DE] focus:border-[#0C4B32] outline-none text-[#26352D]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#889B90] hover:text-[#26352D]"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {authPhoneError && (
                          <p className="text-red-600 text-[10px] mt-1 font-medium">{authPhoneError}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full btn btn-primary py-2.5 text-xs justify-center font-bold shadow-xs cursor-pointer"
                      >
                        {authLoading ? "Signing in..." : "Sign In to Farm Dashboard"}
                      </button>
                    </>
                  )}

                  {/* BOTTOM TOGGLE BETWEEN SIGN IN AND SIGN UP */}
                  <div className="pt-2 text-center text-[11px] text-[#55685D]">
                    {authMode === "signin" ? (
                      <span>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("signup");
                            setAuthStep("form");
                            setAuthPhoneError("");
                            setAlreadyVerifiedNotice(false);
                          }}
                          className="text-[#0C4B32] font-bold hover:underline cursor-pointer"
                        >
                          Sign Up Free
                        </button>
                      </span>
                    ) : (
                      <span>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("signin");
                            setAuthStep("form");
                            setAuthPhoneError("");
                            setAlreadyVerifiedNotice(false);
                          }}
                          className="text-[#0C4B32] font-bold hover:underline cursor-pointer"
                        >
                          Sign In Directly
                        </button>
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
