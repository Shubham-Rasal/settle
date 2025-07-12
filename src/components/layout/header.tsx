"use client";

import { usePathname } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Bell, User } from "lucide-react";

function getBreadcrumb(pathname: string) {
    const paths = pathname.split("/").filter(Boolean);
    const formattedPaths = paths.map(path => 
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
    );
    return formattedPaths;
}

export function Header() {
    const pathname = usePathname();
    const breadcrumbs = getBreadcrumb(pathname);

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <div className="flex items-center space-x-4">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb} className="flex items-center">
                            {index > 0 && (
                                <ChevronDown className="h-4 w-4 mx-2 rotate-[-90deg] text-muted-foreground" />
                            )}
                            <span className={index === breadcrumbs.length - 1 ? "font-medium" : "text-muted-foreground"}>
                                {crumb}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <User className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        admin@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                API Keys
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
} 