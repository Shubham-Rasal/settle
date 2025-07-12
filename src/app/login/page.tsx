"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@/components/auth/signin";
import { SignUp } from "@/components/auth/signup";
import { Toaster } from "sonner";

export default function LoginPage() {
    const [isSignIn, setIsSignIn] = useState(true);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card rounded-xl shadow-2xl p-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <Image
                        src="/vercel.svg"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="h-12 w-auto"
                    />
                </div>

                {/* Title */}
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                    {isSignIn ? "Sign in to your account" : "Create your account"}
                </h2>

                {/* Tabs */}
                <div className="flex justify-center space-x-4 border-b border-border">
                    <button
                        onClick={() => setIsSignIn(true)}
                        className={`pb-2 px-4 ${
                            isSignIn
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignIn(false)}
                        className={`pb-2 px-4 ${
                            !isSignIn
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Auth Components */}
                {isSignIn ? <SignIn /> : <SignUp />}

                {/* Terms and Privacy */}
                <div className="mt-6 text-center text-xs text-muted-foreground">
                    <p>
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:text-primary/90">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:text-primary/90">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
            <Toaster richColors />
        </div>
    );
} 