"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
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
import { authClient, useSession } from "@/lib/auth/client";
import Link from "next/link";

function getBreadcrumb(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  const formattedPaths = paths.map(
    (path) => path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ")
  );
  return formattedPaths;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const breadcrumbs = getBreadcrumb(pathname);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-12 items-center px-4">
        <Link href="/dashboard" className="mr-4">
          <Image
            src="/logo.png"
            alt="Settle Logo"
            width={100}
            height={32}
            className="h-6 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb} className="flex items-center">
              {index > 0 && (
                <ChevronDown className="h-4 w-4 mx-2 rotate-[-90deg] text-muted-foreground" />
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "font-medium"
                    : "text-muted-foreground"
                }
              >
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
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Profile Settings</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
