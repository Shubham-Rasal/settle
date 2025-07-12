"use client";

import Link from "next/link";
import Image from "next/image";
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
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    // {
    //     label: "Payments",
    //     icon: CircleDollarSign,
    //     href: "/dashboard/payments",
    // },
    // {
    //     label: "Cross-Chain",
    //     icon: ArrowLeftRight,
    //     href: "/dashboard/cross-chain",
    // },
    {
        label: "Rebalance",
        icon: RefreshCw,
        href: "/dashboard/rebalance",
    },
    {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
    },
    {
        label: "On Ramp",
        icon: BarChart3,
        href: "/dashboard/onramp",
    },
    {
        label: "Wallets",
        icon: Wallet,
        href: "/dashboard/wallets",
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
        <div className="space-y-2 py-2 flex flex-col h-full bg-sidebar text-sidebar-foreground">
            <div className="px-3 py-1 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-8">
                    <Image
                        src="/logo.png"
                        alt="Settle Logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                    />
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition",
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
            <div className="px-3 py-1">
                {bottomRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm group flex p-2 w-full justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition",
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