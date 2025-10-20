// Paystack integration utilities
export interface PaystackConfig {
  publicKey: string
  secretKey: string
}

export interface PaystackPaymentData {
  email: string
  amount: number // Amount in kobo (multiply by 100 for naira)
  reference: string
  metadata?: Record<string, any>
  callback_url?: string
}

export interface PaystackVerificationResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    fees: number
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: Record<string, any> | null
      risk_action: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
    }
    plan: any
  }
}

export class PaystackService {
  private secretKey: string
  private publicKey: string

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || ""
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""

    if (!this.secretKey) {
      console.warn("PAYSTACK_SECRET_KEY is not set")
    }
    if (!this.publicKey) {
      console.warn("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set")
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: PaystackPaymentData): Promise<{
    status: boolean
    message: string
    data?: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }> {
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack initialization error:", error)
      return {
        status: false,
        message: "Failed to initialize payment",
      }
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Paystack verification error:", error)
      return {
        status: false,
        message: "Failed to verify payment",
        data: {} as any,
      }
    }
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(prefix = "PAY"): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000)
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Convert amount to kobo (Paystack uses kobo)
   */
  toKobo(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Convert kobo to naira
   */
  fromKobo(amount: number): number {
    return amount / 100
  }

  getPublicKey(): string {
    return this.publicKey
  }
}

export const paystackService = new PaystackService()
