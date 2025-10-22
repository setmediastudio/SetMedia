/**
 * Comprehensive input sanitization utilities
 * Prevents XSS, SQL injection, and other injection attacks
 */

export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(input: string): string {
    if (!input) return ""

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  }

  /**
   * Sanitize user input to remove dangerous characters
   */
  static sanitizeInput(input: string): string {
    if (!input) return ""

    return input
      .trim()
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .replace(/data:/gi, "")
      .replace(/vbscript:/gi, "")
  }

  /**
   * Sanitize email addresses
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim().replace(/[<>]/g, "")
  }

  /**
   * Sanitize file names to prevent directory traversal
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/\.\./g, "") // Remove directory traversal
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars
      .replace(/_{2,}/g, "_") // Replace multiple underscores
      .substring(0, 255) // Limit length
  }

  /**
   * Sanitize URLs to prevent open redirect attacks
   */
  static sanitizeURL(url: string, allowedDomains: string[] = []): string | null {
    try {
      const parsed = new URL(url)

      // Only allow http and https
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return null
      }

      // Check against allowed domains if provided
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some((domain) => parsed.hostname.endsWith(domain))
        if (!isAllowed) {
          return null
        }
      }

      return parsed.toString()
    } catch {
      return null
    }
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(input: string): Record<string, any> | null {
    try {
      const parsed = JSON.parse(input)
      return this.deepSanitize(parsed)
    } catch {
      return null
    }
  }

  /**
   * Recursively sanitize object properties
   */
  private static deepSanitize(obj: any): any {
    if (typeof obj === "string") {
      return this.sanitizeInput(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitize(item))
    }

    if (obj !== null && typeof obj === "object") {
      const sanitized: Record<string, any> = {}
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.sanitizeInput(key)] = this.deepSanitize(value)
      }
      return sanitized
    }

    return obj
  }

  /**
   * Validate and sanitize phone numbers
   */
  static sanitizePhoneNumber(phone: string): string | null {
    const cleaned = phone.replace(/\D/g, "")

    if (cleaned.length < 10 || cleaned.length > 15) {
      return null
    }

    return cleaned
  }

  /**
   * Sanitize search queries to prevent injection
   */
  static sanitizeSearchQuery(query: string): string {
    return query.trim().replace(/[<>]/g, "").replace(/["']/g, "").substring(0, 200)
  }
}
