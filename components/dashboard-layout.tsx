"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Upload, FileText, Database, Building2, LayoutDashboard, LogOut, Search, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"
import { useState, useEffect } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    description: "Overview of system metrics",
  },
  {
    title: "Upload",
    url: "/upload",
    icon: Upload,
    description: "Upload new SAP FICO documents",
  },
  {
    title: "Uploaded Files",
    url: "/files",
    icon: FileText,
    description: "View and manage uploaded files",
  },
  {
    title: "Chunks",
    url: "/chunks",
    icon: Database,
    description: "Admin view of all text chunks",
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
    description: "Search through document chunks",
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Settings,
    description: "User management and admin settings",
    adminOnly: true,
  },
]

function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    // Changed variant to "sidebar" and added collapsible="icon"
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">SAP FICO</h2>
            <p className="text-xs text-sidebar-foreground/70">Vector Uploader</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter((item) => !item.adminOnly || (user && user.is_admin))
                .map((item) => {
                  const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.description}>
                        <Link href={item.url} className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-foreground/60">© 2024 SAP FICO Tools</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// Small header component that can safely use the sidebar context
function TopHeader() {
  const { state } = useSidebar()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Sidebar toggle button */}
        <SidebarTrigger className="-ml-1" />

        {state === "collapsed" && (
          <div className="flex items-center space-x-3 ml-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">SAP FICO</h2>
              <p className="text-xs text-muted-foreground">Vector Uploader</p>
            </div>
          </div>
        )}
        <div className="flex-1" />
        
        {/* User and logout section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
            {user?.is_admin && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout} 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    // This ensures the component only renders fully on the client-side
    // to avoid hydration errors with authentication state
    setClientReady(true)
  }, [])

  // Skip layout for login and register pages
  const isAuthPage = pathname === "/login" || pathname === "/register"

  // For auth pages, always render without dashboard layout
  if (isAuthPage) {
    return <>{children}</>
  }
  
  // For non-auth pages, only render full dashboard when client is ready
  // Otherwise render a loading state or minimal placeholder
  if (!clientReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // For authenticated users on regular pages, render with full dashboard layout
  return (
    <SidebarProvider>
      {/* Apply group/sidebar-wrapper to the main flex container */}
      <div className="group/sidebar-wrapper flex min-h-screen w-full">
        <AppSidebar />
        {/* Applied dynamic padding directly to main */}
        <main
          className={cn(
            "flex-1 flex flex-col transition-[padding-left] duration-200 ease-linear",
            "md:pl-[--sidebar-width]", // Default padding for expanded sidebar on desktop
            // Adjust padding when the sidebar is collapsed (on desktop)
            "group-data-[state=collapsed]/sidebar-wrapper:md:pl-[--sidebar-width-icon]",
          )}
        >
          <TopHeader />
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
