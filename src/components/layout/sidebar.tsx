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
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (isCollapsed) {
            root.classList.add('sidebar-collapsed');
        } else {
            root.classList.remove('sidebar-collapsed');
        }
    }, [isCollapsed]);

    const NavLink = ({ route, className }: { route: typeof routes[0], className?: string }) => {
        const content = (
            <div className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "flex-row"
            )}>
                <route.icon className={cn(
                    "h-5 w-5",
                    !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && route.label}
            </div>
        );

        return (
            <Link
                href={route.href}
                className={cn(
                    "text-sm group flex p-2 justify-start font-medium cursor-pointer hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition",
                    pathname === route.href ? "text-sidebar-foreground bg-sidebar-accent" : "text-muted-foreground",
                    isCollapsed && "justify-center",
                    className
                )}
            >
                {isCollapsed ? (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {content}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="z-[100]">
                                {route.label}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : content}
            </Link>
        );
    };

    return (
        <div className={cn(
            "relative space-y-2 py-2 flex flex-col h-full bg-sidebar text-sidebar-foreground transition-all duration-300",
            isCollapsed ? "w-16" : "w-60"
        )}>
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-sidebar border border-border hover:bg-sidebar-accent"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>
            <div className="px-3 py-1 flex-1">
                <Link href="/dashboard" className={cn(
                    "flex items-center mb-8",
                    isCollapsed ? "justify-center" : "pl-3"
                )}>
                    <Image
                        src="/logo.png"
                        alt="Settle Logo"
                        width={isCollapsed ? 32 : 120}
                        height={isCollapsed ? 32 : 40}
                        className="h-8 w-auto"
                    />
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <NavLink key={route.href} route={route} />
                    ))}
                </div>
            </div>
            <div className="px-3 py-1">
                {bottomRoutes.map((route) => (
                    <NavLink key={route.href} route={route} />
                ))}
            </div>
        </div>
    );
} 