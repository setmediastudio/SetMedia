import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address").max(255, "Email too long")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  )

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-$$$$]+$/, "Invalid phone number format")
  .min(10, "Phone number too short")
  .max(20, "Phone number too long")

// Authentication schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  turnstileToken: z.string().min(1, "Security verification required"),
})

export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    turnstileToken: z.string().min(1, "Security verification required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  turnstileToken: z.string().min(1, "Security verification required"),
})

// File upload schemas
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required").max(255, "File name too long"),
  size: z.number().max(50 * 1024 * 1024, "File size must be less than 50MB"),
  type: z.string().regex(/^(image|video)\/(jpeg|jpg|png|gif|webp|mp4|mov|avi)$/, "Invalid file type"),
})

// Booking schemas
export const bookingSchema = z.object({
  date: z.string().datetime("Invalid date format"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  duration: z.number().min(30, "Minimum duration is 30 minutes").max(480, "Maximum duration is 8 hours"),
  type: z.enum(["portrait", "wedding", "event", "commercial"], {
    errorMap: () => ({ message: "Invalid booking type" }),
  }),
  notes: z.string().max(1000, "Notes too long").optional(),
})

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
  turnstileToken: z.string().min(1, "Security verification required"),
})

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .substring(0, 255) // Limit length
}

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ["Validation failed"] }
    }
  }
}
