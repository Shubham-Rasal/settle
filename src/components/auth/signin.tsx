"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    return (
        <div className="mt-8 space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                        value={email}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="Password"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary focus:ring-offset-card"
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-2 block text-sm text-muted-foreground"
                        >
                            Remember me
                        </label>
                    </div>
                    <div className="text-sm">
                        <a
                            href="/forgot-password"
                            className="font-medium text-primary hover:text-primary/90"
                        >
                            Forgot password?
                        </a>
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                        await signIn.email({
                            email,
                            password,
                            callbackURL: "/dashboard",
                            fetchOptions: {
                                onResponse: () => {
                                    setLoading(false);
                                },
                                onRequest: () => {
                                    setLoading(true);
                                },
                                onError: (ctx) => {
                                    toast.error(ctx.error.message);
                                },
                                onSuccess: async () => {
                                    router.push("/dashboard");
                                },
                            },
                        });
                    }}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </div>
        </div>
    );
} 