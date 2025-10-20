declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
    sessionType?: string
    provider?: string
    sessionId?: string
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    userId?: string
    sessionType?: string
    provider?: string
    sessionId?: string
  }
}
