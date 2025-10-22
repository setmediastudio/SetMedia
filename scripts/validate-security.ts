interface ValidationResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
}

const results: ValidationResult[] = []

function checkEnvironmentVariables(): void {
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
    if (process.env[varName]) {
      results.push({
        name: `Environment Variable: ${varName}`,
        status: "pass",
        message: "Set correctly",
      })
    } else {
      results.push({
        name: `Environment Variable: ${varName}`,
        status: "fail",
        message: "Missing - required for security",
      })
    }
  })
}

function checkSecretStrength(): void {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const csrfSecret = process.env.CSRF_SECRET

  if (nextAuthSecret && nextAuthSecret.length >= 32) {
    results.push({
      name: "NEXTAUTH_SECRET Strength",
      status: "pass",
      message: "Sufficient length (32+ characters)",
    })
  } else {
    results.push({
      name: "NEXTAUTH_SECRET Strength",
      status: "fail",
      message: "Too short - must be 32+ characters",
    })
  }

  if (csrfSecret && csrfSecret.length >= 32) {
    results.push({
      name: "CSRF_SECRET Strength",
      status: "pass",
      message: "Sufficient length (32+ characters)",
    })
  } else {
    results.push({
      name: "CSRF_SECRET Strength",
      status: "fail",
      message: "Too short - must be 32+ characters",
    })
  }
}

function checkProductionSettings(): void {
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXTAUTH_URL?.startsWith("https://")) {
      results.push({
        name: "Production HTTPS",
        status: "pass",
        message: "NEXTAUTH_URL uses HTTPS",
      })
    } else {
      results.push({
        name: "Production HTTPS",
        status: "fail",
        message: "NEXTAUTH_URL must use HTTPS in production",
      })
    }

    if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12) {
      results.push({
        name: "Admin Password Strength",
        status: "pass",
        message: "Strong password (12+ characters)",
      })
    } else {
      results.push({
        name: "Admin Password Strength",
        status: "warning",
        message: "Consider using a stronger password (12+ characters)",
      })
    }
  }
}

function checkOAuthConfiguration(): void {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (clientId && clientId.length > 20) {
    results.push({
      name: "Google OAuth Client ID",
      status: "pass",
      message: "Configured",
    })
  } else {
    results.push({
      name: "Google OAuth Client ID",
      status: "fail",
      message: "Missing or invalid",
    })
  }

  if (clientSecret && clientSecret.length > 20) {
    results.push({
      name: "Google OAuth Client Secret",
      status: "pass",
      message: "Configured",
    })
  } else {
    results.push({
      name: "Google OAuth Client Secret",
      status: "fail",
      message: "Missing or invalid",
    })
  }
}

function printResults(): void {
  console.log("\n" + "=".repeat(60))
  console.log("SECURITY CONFIGURATION VALIDATION REPORT")
  console.log("=".repeat(60) + "\n")

  const passed = results.filter((r) => r.status === "pass").length
  const failed = results.filter((r) => r.status === "fail").length
  const warnings = results.filter((r) => r.status === "warning").length

  results.forEach((result) => {
    const icon = result.status === "pass" ? "✓" : result.status === "fail" ? "✗" : "⚠"
    const color = result.status === "pass" ? "\x1b[32m" : result.status === "fail" ? "\x1b[31m" : "\x1b[33m"
    const reset = "\x1b[0m"

    console.log(`${color}${icon}${reset} ${result.name}`)
    console.log(`  ${result.message}\n`)
  })

  console.log("=".repeat(60))
  console.log(`Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`)
  console.log("=".repeat(60) + "\n")

  if (failed > 0) {
    console.log("❌ Security validation FAILED - fix issues before deployment\n")
    process.exit(1)
  } else if (warnings > 0) {
    console.log("⚠️  Security validation passed with warnings\n")
  } else {
    console.log("✅ All security checks passed!\n")
  }
}

// Run validation
console.log("Running security configuration validation...\n")
checkEnvironmentVariables()
checkSecretStrength()
checkProductionSettings()
checkOAuthConfiguration()
printResults()
