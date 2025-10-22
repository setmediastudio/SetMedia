/**
 * Comprehensive Security Configuration
 * This file centralizes all security settings and best practices
 */

// OAuth Configuration
export const oauthConfig = {
  // Ensure NEXTAUTH_URL is set correctly in environment
  // For development: http://localhost:3000
  // For production: https://yourdomain.com
  redirectUriPath: "/api/auth/callback/google",

  // OAuth scopes - minimal required permissions
  scopes: ["openid", "profile", "email"],

  // Prevent account linking vulnerabilities
  allowDangerousEmailAccountLinking: false,
}

// Session Security
export const sessionConfig = {
  // JWT token expiration (30 days)
  maxAge: 30 * 24 * 60 * 60,

  // Session update interval (24 hours)
  updateAge: 24 * 60 * 60,

  // Require HTTPS in production
  secure: process.env.NODE_ENV === "production",

  // HttpOnly cookies prevent XSS attacks
  httpOnly: true,

  // SameSite prevents CSRF attacks
  sameSite: "strict" as const,
}

// Password Policy
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional but recommended
}

// Rate Limiting Configuration
export const rateLimitConfig = {
  // Authentication attempts
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // General API requests
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // Sensitive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // Registration attempts
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },

  // Password reset attempts
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
}

// CORS Configuration
export const corsConfig = {
  // Only allow requests from your domain
  allowedOrigins: [process.env.NEXTAUTH_URL || "http://localhost:3000"],

  // Allowed HTTP methods
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

  // Allowed headers
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],

  // Credentials allowed
  credentials: true,

  // Max age for preflight cache (1 hour)
  maxAge: 3600,
}

// Content Security Policy
export const cspConfig = {
  // Strict default policy
  defaultSrc: ["'self'"],

  // Scripts - only from same origin
  scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://accounts.google.com"],

  // Styles
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

  // Fonts
  fontSrc: ["'self'", "https://fonts.gstatic.com"],

  // Images
  imgSrc: ["'self'", "data:", "https:", "blob:"],

  // External connections
  connectSrc: [
    "'self'",
    "https://challenges.cloudflare.com",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
  ],

  // Frames
  frameSrc: ["https://challenges.cloudflare.com", "https://accounts.google.com"],

  // Disable plugins
  objectSrc: ["'none'"],

  // Form submissions
  formAction: ["'self'"],

  // Frame ancestors
  frameAncestors: ["'none'"],
}

// Security Headers
export const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",

  // HSTS (HTTPS only)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // DNS prefetch control
  "X-DNS-Prefetch-Control": "off",
}

// Input Validation Rules
export const validationRules = {
  // Email validation
  email: {
    maxLength: 255,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Password validation
  password: {
    minLength: 8,
    maxLength: 128,
  },

  // Name validation
  name: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
  },

  // Phone validation
  phone: {
    minLength: 10,
    maxLength: 20,
    pattern: /^\+?[\d\s\-()]+$/,
  },
}

// File Upload Security
export const fileUploadConfig = {
  // Maximum file size (50MB)
  maxSize: 50 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ],

  // Scan for malware (implement with external service)
  scanForMalware: true,

  // Virus scanning endpoint
  virusScanEndpoint: process.env.VIRUS_SCAN_ENDPOINT,
}

// Logging Configuration
export const loggingConfig = {
  // Log security events
  logSecurityEvents: true,

  // Log authentication attempts
  logAuthAttempts: true,

  // Log API access
  logAPIAccess: false, // Set to true for debugging

  // Retention period (days)
  retentionDays: 90,
}

// Environment Variable Validation
export function validateEnvironmentVariables(): void {
  const requiredVars = [
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "CSRF_SECRET",
    "TURNSTILE_SECRET_KEY",
    "TURNSTILE_SITE_KEY",
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars)
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
    }
  }
}

export function validateSecuritySetup(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required environment variables
  const requiredVars = [
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "CSRF_SECRET",
    "TURNSTILE_SECRET_KEY",
    "TURNSTILE_SITE_KEY",
  ]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`Missing environment variable: ${varName}`)
    }
  })

  // Check secret strength
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push("NEXTAUTH_SECRET must be at least 32 characters")
  }

  if (process.env.CSRF_SECRET && process.env.CSRF_SECRET.length < 32) {
    errors.push("CSRF_SECRET must be at least 32 characters")
  }

  // Check production settings
  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL?.startsWith("https://")) {
      errors.push("NEXTAUTH_URL must use HTTPS in production")
    }

    if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12) {
      errors.push("Admin password must be at least 12 characters in production")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
