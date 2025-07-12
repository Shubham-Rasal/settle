"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CircleDollarSign,
    ArrowLeftRight,
    Users,
    Settings,
    Wallet,
    BarChart3,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Payments",
        icon: CircleDollarSign,
        href: "/dashboard/payments",
        color: "text-violet-500",
    },
    {
        label: "Cross-Chain",
        icon: ArrowLeftRight,
        href: "/dashboard/cross-chain",
        color: "text-pink-700",
    },
    {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
        color: "text-orange-700",
    },
    {
        label: "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
        color: "text-emerald-500",
    },
    {
        label: "Wallets",
        icon: Wallet,
        href: "/dashboard/wallets",
        color: "text-green-700",
    },
];

const bottomRoutes = [
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
    {
        label: "Help",
        icon: HelpCircle,
        href: "/dashboard/help",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Settle.
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition",
                                pathname === route.href ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                {bottomRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition",
                            pathname === route.href ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center flex-1">
                            <route.icon className="h-5 w-5 mr-3" />
                            {route.label}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
} 