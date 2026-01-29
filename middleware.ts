import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { addSecurityHeaders } from "@/lib/security-headers"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isClientRoute = req.nextUrl.pathname.startsWith("/client")
    const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"
    const isOldDashboard = req.nextUrl.pathname === "/dashboard"
    const isAPIRoute = req.nextUrl.pathname.startsWith("/api")

    if (isAdminRoute && token && token.role !== "admin") {
      console.warn(`[SECURITY] Unauthorized admin access attempt from user: ${token.userId}`)
    }

    // Allow access to admin login page
    if (isAdminLoginRoute) {
      const response = NextResponse.next()
      return addSecurityHeaders(response)
    }

    if (isAdminRoute && (token?.role !== "admin" || token?.sessionType !== "admin")) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url))
      return addSecurityHeaders(response)
    }

    if (isClientRoute && token?.sessionType === "admin") {
      const response = NextResponse.redirect(new URL("/admin/dashboard", req.url))
      return addSecurityHeaders(response)
    }

    // Protect client routes - only user sessions can access
    if (isClientRoute && (!token || token?.sessionType !== "user")) {
      const response = NextResponse.redirect(new URL("/auth/signin", req.url))
      return addSecurityHeaders(response)
    }

    // Redirect authenticated users from old dashboard to appropriate dashboard
    if (isOldDashboard) {
      if (token?.role === "admin" && token?.sessionType === "admin") {
        const response = NextResponse.redirect(new URL("/admin/dashboard", req.url))
        return addSecurityHeaders(response)
      } else if (token?.sessionType === "user") {
        const response = NextResponse.redirect(new URL("/client/dashboard", req.url))
        return addSecurityHeaders(response)
      } else {
        const response = NextResponse.redirect(new URL("/auth/signin", req.url))
        return addSecurityHeaders(response)
      }
    }

    const response = NextResponse.next()
    return addSecurityHeaders(response)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
        const isClientRoute = req.nextUrl.pathname.startsWith("/client")
        const isAdminLoginRoute = req.nextUrl.pathname === "/admin/login"
        const isOldDashboard = req.nextUrl.pathname === "/dashboard"

        // Allow admin login page
        if (isAdminLoginRoute) return true

        // Allow old dashboard for redirect handling
        if (isOldDashboard) return !!token

        if (isAdminRoute) {
          return !!token && token.role === "admin" && token.sessionType === "admin"
        }

        if (isClientRoute) {
          return !!token && token.sessionType === "user"
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/client/:path*", "/admin/:path*", "/dashboard", "/api/:path*"],
}
