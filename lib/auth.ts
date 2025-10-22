import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import dbConnect from "./mongodb"
import User from "@/models/User"
import { logSecurityEvent } from "./security-monitor"
import { verifyTurnstileToken } from "./turnstile"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        if (credentials.turnstileToken) {
          try {
            const turnstileResult = await verifyTurnstileToken(credentials.turnstileToken)
            if (!turnstileResult.success) {
              await logSecurityEvent({
                event: "turnstile_failure",
                severity: "medium",
                ipAddress: "server",
                details: {
                  errors: turnstileResult["error-codes"],
                  email: credentials.email,
                },
              })
              throw new Error("Security verification failed")
            }
          } catch (error) {
            console.error("Turnstile verification error:", error)
            throw new Error("Security verification failed")
          }
        }

        try {
          await dbConnect()
          const user = await User.findOne({ email: credentials.email })

          if (!user || user.provider !== "credentials") {
            await logSecurityEvent({
              event: "login_failure",
              severity: "medium",
              ipAddress: "server",
              details: {
                reason: "User not found or wrong provider",
                email: credentials.email,
              },
            })
            throw new Error("Invalid email or password")
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          if (!isPasswordValid) {
            await logSecurityEvent({
              userId: user._id.toString(),
              event: "login_failure",
              severity: "medium",
              ipAddress: "server",
              details: {
                reason: "Invalid password",
                email: credentials.email,
              },
            })
            throw new Error("Invalid email or password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Admin Email", type: "email" },
        password: { label: "Admin Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Admin email and password are required")
        }

        if (credentials.turnstileToken) {
          try {
            const turnstileResult = await verifyTurnstileToken(credentials.turnstileToken)
            if (!turnstileResult.success) {
              await logSecurityEvent({
                event: "turnstile_failure",
                severity: "high",
                ipAddress: "server",
                details: {
                  errors: turnstileResult["error-codes"],
                  email: credentials.email,
                  loginType: "admin",
                },
              })
              throw new Error("Security verification failed")
            }
          } catch (error) {
            console.error("Admin Turnstile verification error:", error)
            throw new Error("Security verification failed")
          }
        }

        if (credentials.email === process.env.ADMIN_EMAIL && credentials.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "admin-user",
            email: process.env.ADMIN_EMAIL,
            name: "Admin",
            role: "admin",
          }
        } else {
          await logSecurityEvent({
            event: "login_failure",
            severity: "high",
            ipAddress: "server",
            details: {
              reason: "Invalid admin credentials",
              email: credentials.email,
              loginType: "admin",
            },
          })
          throw new Error("Invalid admin credentials")
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect()

          const existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              role: "user",
            })
          }

          return true
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.provider = account?.provider
        token.userId = user.id

        const timestamp = Date.now()
        if (account?.provider === "admin-credentials") {
          token.sessionType = "admin"
          token.sub = `admin-${user.id}-${timestamp}`
          token.sessionId = `admin-session-${timestamp}`
        } else {
          token.sessionType = "user"
          token.sub = `user-${user.id}-${timestamp}`
          token.sessionId = `user-session-${timestamp}`
        }

        try {
          await logSecurityEvent({
            userId: user.id,
            sessionId: token.sessionId as string,
            event: "login_success",
            severity: "low",
            ipAddress: "server",
            details: {
              provider: account?.provider,
              sessionType: token.sessionType,
              timestamp: new Date(),
            },
          })
        } catch (error) {
          console.error("Failed to log login success:", error)
        }
      } else if (token.email && token.sessionType !== "admin") {
        try {
          await dbConnect()
          const dbUser = await User.findOne({ email: token.email })
          if (dbUser) {
            if (token.role !== dbUser.role) {
              await logSecurityEvent({
                userId: token.userId as string,
                sessionId: token.sessionId as string,
                event: "suspicious_activity",
                severity: "high",
                ipAddress: "server",
                details: {
                  reason: "Role change detected during session",
                  oldRole: token.role,
                  newRole: dbUser.role,
                  timestamp: new Date(),
                },
              })
            }
            token.role = dbUser.role
            token.userId = dbUser._id.toString()
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }

      if (token.sessionType === "admin" && token.role !== "admin") {
        try {
          await logSecurityEvent({
            userId: token.userId as string,
            sessionId: token.sessionId as string,
            event: "role_escalation_attempt",
            severity: "critical",
            ipAddress: "server",
            details: {
              reason: "Admin session with non-admin role",
              sessionType: token.sessionType,
              role: token.role,
              timestamp: new Date(),
            },
          })
        } catch (error) {
          console.error("Failed to log role escalation attempt:", error)
        }
        token.role = "admin"
      } else if (token.sessionType === "user" && token.role === "admin") {
        try {
          await logSecurityEvent({
            userId: token.userId as string,
            sessionId: token.sessionId as string,
            event: "role_escalation_attempt",
            severity: "critical",
            ipAddress: "server",
            details: {
              reason: "User session attempting admin role",
              sessionType: token.sessionType,
              role: token.role,
              timestamp: new Date(),
            },
          })
        } catch (error) {
          console.error("Failed to log role escalation attempt:", error)
        }
        return null
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string
        session.user.id = token.userId as string
        session.sessionType = token.sessionType as string
        session.provider = token.provider as string
        session.sessionId = token.sessionId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.userId && token?.sessionId) {
        try {
          await logSecurityEvent({
            userId: token.userId as string,
            sessionId: token.sessionId as string,
            event: "logout",
            severity: "low",
            ipAddress: "server",
            details: {
              sessionType: token.sessionType,
              timestamp: new Date(),
            },
          })
        } catch (error) {
          console.error("Failed to log logout:", error)
        }
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
}
