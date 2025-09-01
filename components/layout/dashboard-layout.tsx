"use client";

import type React from "react";
import { useState } from "react";
import { useSession, useAuth } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Users,
  CreditCard,
  Send,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  BarChart3,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const clientNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/beneficiaries", icon: Users, label: "Beneficiaries" },
  {
    href: "/dashboard/subscriptions",
    icon: CreditCard,
    label: "Subscriptions",
  },
  { href: "/dashboard/transfers", icon: Send, label: "Transfers" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
];

const adminNavItems = [
  { href: "/admin", icon: BarChart3, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/transfers", icon: Send, label: "All Transfers" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/reports", icon: FileText, label: "Reports" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

const madagascarNavItems = [
  { href: "/madagascar", icon: Home, label: "Dashboard" },
  { href: "/madagascar/transfers", icon: Send, label: "Pending Transfers" },
  { href: "/madagascar/completed", icon: DollarSign, label: "Completed" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const { signOut, isSigningOut } = useAuth();
  const pathname = usePathname();

  const getNavItems = () => {
    switch (session?.user?.role) {
      case "ADMIN":
        return adminNavItems;
      case "MADAGASCAR_TEAM":
        return madagascarNavItems;
      default:
        return clientNavItems;
    }
  };

  const navItems = getNavItems();

  const handleSignOut = () => {
    if (!isSigningOut) {
      signOut();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-52 bg-card shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-12 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <img
                src="/placeholder-logo.svg"
                alt="TransferApp Logo"
                className="h-5 w-5"
              />
            </div>
            <h1 className="text-base font-bold text-emerald-600">
              TransferApp
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-7 w-7 p-0 hover:bg-muted/50 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <nav className="mt-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-3rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-r-2 border-emerald-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-2 h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-52 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-card shadow-sm border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between h-12 px-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-7 w-7 p-0 hover:bg-muted/50 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-3 w-3" />
            </Button>

            <div className="flex items-center space-x-4 ml-auto">
              <ThemeToggle />
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-7 w-7 rounded-full p-0 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px]">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <LogOut className="mr-2 h-3 w-3" />
                    <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
