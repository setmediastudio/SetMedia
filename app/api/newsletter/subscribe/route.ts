import { type NextRequest, NextResponse } from "next/server"

// Brevo (formerly Sendinblue) API integration
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID || "2"
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@setmedia.com"
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Set Media"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 })
    }

    // Check if Brevo API key is configured
    if (!BREVO_API_KEY) {
      console.error("[Newsletter] BREVO_API_KEY is not configured")
      return NextResponse.json(
        { success: false, error: "Newsletter service is not configured. Please contact support." },
        { status: 500 },
      )
    }

    console.log(`[Newsletter] Processing subscription for: ${email}`)

    // Step 1: Add contact to Brevo list
    const addContactResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [Number.parseInt(BREVO_LIST_ID)],
        updateEnabled: true,
        attributes: {
          SIGNUP_SOURCE: "website_newsletter",
          SIGNUP_DATE: new Date().toISOString(),
        },
      }),
    })

    const contactResponseText = await addContactResponse.text()
    let contactData = null
    try {
      contactData = contactResponseText ? JSON.parse(contactResponseText) : null
    } catch {
      contactData = null
    }

    console.log(`[Newsletter] Add contact response: ${addContactResponse.status}`, contactData)

    // Handle contact creation (201 = created, 204 = updated, or duplicate error is OK)
    if (!addContactResponse.ok && addContactResponse.status !== 204) {
      if (contactData?.code !== "duplicate_parameter") {
        console.error("[Newsletter] Failed to add contact:", contactData)
        return NextResponse.json(
          { success: false, error: contactData?.message || "Failed to subscribe. Please try again." },
          { status: 500 },
        )
      }
      console.log(`[Newsletter] Contact already exists: ${email}`)
    }

    // Step 2: Send welcome email via Brevo transactional email API
    const welcomeEmailPayload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email: email }],
      subject: "Welcome to Set Media Newsletter!",
      htmlContent: generateWelcomeEmailHTML(email),
    }

    console.log(`[Newsletter] Sending welcome email from: ${BREVO_SENDER_EMAIL}`)

    const welcomeEmailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(welcomeEmailPayload),
    })

    const emailResponseText = await welcomeEmailResponse.text()
    let emailData = null
    try {
      emailData = emailResponseText ? JSON.parse(emailResponseText) : null
    } catch {
      emailData = { raw: emailResponseText }
    }

    console.log(`[Newsletter] Welcome email response: ${welcomeEmailResponse.status}`, emailData)

    if (!welcomeEmailResponse.ok) {
      console.error("[Newsletter] Failed to send welcome email:", emailData)
      // Return specific error message to help diagnose
      return NextResponse.json({
        success: true,
        message: "Subscribed, but welcome email could not be sent",
        emailError: emailData?.message || "Email delivery failed",
        hint: "Please verify your sender email in Brevo dashboard",
      })
    }

    console.log(`[Newsletter] Welcome email sent successfully to: ${email}, messageId: ${emailData?.messageId}`)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed! Check your inbox for a welcome email.",
      messageId: emailData?.messageId,
    })
  } catch (error) {
    console.error("[Newsletter] Subscription error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to subscribe" },
      { status: 500 },
    )
  }
}

function generateWelcomeEmailHTML(subscriberEmail: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://setmedia.com"
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Set Media</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f1419; color: #ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f1419; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1a1f26; border-radius: 16px; overflow: hidden; border: 1px solid #2d3748;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, #1f2937 0%, #1a1f26 100%);">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="width: 70px; height: 70px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="font-size: 32px; line-height: 70px;">&#128248;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 24px 0 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Welcome to Set Media
              </h1>
              <p style="margin: 12px 0 0; font-size: 16px; color: #d4af37; font-weight: 500;">
                Your journey into cinematic photography begins
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.7; color: #a0aec0;">
                Thank you for subscribing to our newsletter! We're excited to have you join our creative community of photography enthusiasts and visual storytellers.
              </p>
              
              <!-- Benefits Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0; background-color: #0f1419; border-radius: 12px; padding: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">
                      What You'll Receive
                    </p>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 28px;">
                          <span style="color: #d4af37;">&#10003;</span>
                        </td>
                        <td style="padding: 10px 0; color: #e2e8f0; font-size: 15px;">
                          <strong>Exclusive behind-the-scenes</strong> content from our shoots
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 28px;">
                          <span style="color: #d4af37;">&#10003;</span>
                        </td>
                        <td style="padding: 10px 0; color: #e2e8f0; font-size: 15px;">
                          <strong>Early access</strong> to new portfolio releases
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 28px;">
                          <span style="color: #d4af37;">&#10003;</span>
                        </td>
                        <td style="padding: 10px 0; color: #e2e8f0; font-size: 15px;">
                          <strong>Photography tips</strong> and creative inspiration
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; vertical-align: top; width: 28px;">
                          <span style="color: #d4af37;">&#10003;</span>
                        </td>
                        <td style="padding: 10px 0; color: #e2e8f0; font-size: 15px;">
                          <strong>Special offers</strong> and subscriber-only discounts
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 24px 0;">
                    <a href="${appUrl}/portfolio" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #000000; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 30px;">
                      Explore Our Portfolio
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #718096; text-align: center;">
                Stay inspired and keep creating!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #0f1419; border-top: 1px solid #2d3748;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 16px; font-size: 14px; color: #718096;">
                      Follow us for daily inspiration
                    </p>
                    <p style="margin: 0 0 24px;">
                      <a href="#" style="color: #d4af37; text-decoration: none; margin: 0 12px; font-size: 14px;">Instagram</a>
                      <a href="#" style="color: #d4af37; text-decoration: none; margin: 0 12px; font-size: 14px;">Twitter</a>
                      <a href="#" style="color: #d4af37; text-decoration: none; margin: 0 12px; font-size: 14px;">YouTube</a>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #4a5568;">
                      &copy; ${currentYear} Set Media. All rights reserved.
                    </p>
                    <p style="margin: 8px 0 0; font-size: 11px; color: #4a5568;">
                      You received this email because you subscribed at ${subscriberEmail}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
