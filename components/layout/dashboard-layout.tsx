"use client"

import type React from "react"
import { useState } from "react"
import { useSession, useAuth } from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Users, CreditCard, Send, Bell, Settings, LogOut, Menu, X, DollarSign, BarChart3 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const clientNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/beneficiaries", icon: Users, label: "Beneficiaries" },
  { href: "/dashboard/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/dashboard/transfers", icon: Send, label: "Transfers" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
]

const adminNavItems = [
  { href: "/admin", icon: BarChart3, label: "Overview" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/transfers", icon: Send, label: "All Transfers" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

const madagascarNavItems = [
  { href: "/madagascar", icon: Home, label: "Dashboard" },
  { href: "/madagascar/transfers", icon: Send, label: "Pending Transfers" },
  { href: "/madagascar/completed", icon: DollarSign, label: "Completed" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const { signOut } = useAuth()
  const pathname = usePathname()

  const getNavItems = () => {
    switch (session?.user?.role) {
      case "ADMIN":
        return adminNavItems
      case "MADAGASCAR_TEAM":
        return madagascarNavItems
      default:
        return clientNavItems
    }
  }

  const navItems = getNavItems()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold text-emerald-600">TransferApp</h1>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-r-2 border-emerald-600"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
