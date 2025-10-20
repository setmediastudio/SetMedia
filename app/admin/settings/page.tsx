"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  Settings,
  Shield,
  Bell,
  Palette,
  Database,
  Lock,
  Globe,
  CreditCard,
  ImageIcon,
  Calendar,
  Save,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface AdminSettings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    contactEmail: string
    supportEmail: string
    timezone: string
    language: string
    currency: string
  }
  branding: {
    logoUrl: string
    faviconUrl: string
    primaryColor: string
    secondaryColor: string
    customCSS: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    newBookingAlert: boolean
    paymentAlert: boolean
    uploadAlert: boolean
    systemAlert: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordPolicy: string
    ipWhitelist: string
    maxLoginAttempts: number
  }
  storage: {
    maxFileSize: number
    allowedFileTypes: string[]
    storageLimit: number
    autoBackup: boolean
    backupFrequency: string
  }
  payment: {
    stripeEnabled: boolean
    paypalEnabled: boolean
    razorpayEnabled: boolean
    currency: string
    taxRate: number
    processingFee: number
  }
  booking: {
    advanceBookingDays: number
    cancellationPolicy: string
    depositRequired: boolean
    depositPercentage: number
    autoConfirmBookings: boolean
  }
  gallery: {
    watermarkEnabled: boolean
    watermarkText: string
    downloadEnabled: boolean
    socialSharingEnabled: boolean
    passwordProtection: boolean
  }
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<AdminSettings>({
    general: {
      siteName: "Set Media Studio",
      siteDescription: "Professional Photography Services",
      siteUrl: "https://setmedia.studio",
      contactEmail: "contact@setmedia.studio",
      supportEmail: "support@setmedia.studio",
      timezone: "UTC",
      language: "en",
      currency: "USD",
    },
    branding: {
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#0891b2",
      secondaryColor: "#06b6d4",
      customCSS: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newBookingAlert: true,
      paymentAlert: true,
      uploadAlert: true,
      systemAlert: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: "strong",
      ipWhitelist: "",
      maxLoginAttempts: 5,
    },
    storage: {
      maxFileSize: 100,
      allowedFileTypes: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
      storageLimit: 1000,
      autoBackup: true,
      backupFrequency: "daily",
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: false,
      razorpayEnabled: false,
      currency: "USD",
      taxRate: 0,
      processingFee: 2.9,
    },
    booking: {
      advanceBookingDays: 30,
      cancellationPolicy: "24 hours notice required",
      depositRequired: true,
      depositPercentage: 25,
      autoConfirmBookings: false,
    },
    gallery: {
      watermarkEnabled: true,
      watermarkText: "Set Media Studio",
      downloadEnabled: true,
      socialSharingEnabled: true,
      passwordProtection: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleSave = async (section: keyof AdminSettings) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings[section]),
      })

      if (response.ok) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`)
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("Error saving settings")
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (section: keyof AdminSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  if (!session || session.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={{
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
          role: session.user?.role,
        }}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={{
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
            role: session.user?.role,
          }}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto bg-muted/30 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
              <p className="text-muted-foreground">Configure your platform settings and preferences</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Settings className="h-4 w-4 mr-1" />
              Administrator
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Storage</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Booking</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Configure basic site information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => updateSettings("general", "siteName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl">Site URL</Label>
                      <Input
                        id="siteUrl"
                        value={settings.general.siteUrl}
                        onChange={(e) => updateSettings("general", "siteUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSettings("general", "siteDescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSettings("general", "contactEmail", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSettings("general", "supportEmail", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.general.timezone}
                        onValueChange={(value) => updateSettings("general", "timezone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={settings.general.language}
                        onValueChange={(value) => updateSettings("general", "language", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={settings.general.currency}
                        onValueChange={(value) => updateSettings("general", "currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("general")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save General Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding & Appearance
                  </CardTitle>
                  <CardDescription>Customize your brand colors, logo, and visual identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={settings.branding.logoUrl}
                        onChange={(e) => updateSettings("branding", "logoUrl", e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">Favicon URL</Label>
                      <Input
                        id="faviconUrl"
                        value={settings.branding.faviconUrl}
                        onChange={(e) => updateSettings("branding", "faviconUrl", e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.branding.primaryColor}
                          onChange={(e) => updateSettings("branding", "primaryColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.branding.primaryColor}
                          onChange={(e) => updateSettings("branding", "primaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.branding.secondaryColor}
                          onChange={(e) => updateSettings("branding", "secondaryColor", e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={settings.branding.secondaryColor}
                          onChange={(e) => updateSettings("branding", "secondaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customCSS">Custom CSS</Label>
                    <Textarea
                      id="customCSS"
                      value={settings.branding.customCSS}
                      onChange={(e) => updateSettings("branding", "customCSS", e.target.value)}
                      rows={6}
                      placeholder="/* Add your custom CSS here */"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("branding")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Branding Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Channels</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateSettings("notifications", "emailNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) => updateSettings("notifications", "pushNotifications", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smsNotifications">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => updateSettings("notifications", "smsNotifications", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Alert Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="newBookingAlert">New Booking Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when new bookings are made</p>
                        </div>
                        <Switch
                          id="newBookingAlert"
                          checked={settings.notifications.newBookingAlert}
                          onCheckedChange={(checked) => updateSettings("notifications", "newBookingAlert", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="paymentAlert">Payment Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified about payment transactions</p>
                        </div>
                        <Switch
                          id="paymentAlert"
                          checked={settings.notifications.paymentAlert}
                          onCheckedChange={(checked) => updateSettings("notifications", "paymentAlert", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="uploadAlert">Upload Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when files are uploaded</p>
                        </div>
                        <Switch
                          id="uploadAlert"
                          checked={settings.notifications.uploadAlert}
                          onCheckedChange={(checked) => updateSettings("notifications", "uploadAlert", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="systemAlert">System Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified about system updates and issues</p>
                        </div>
                        <Switch
                          id="systemAlert"
                          checked={settings.notifications.systemAlert}
                          onCheckedChange={(checked) => updateSettings("notifications", "systemAlert", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("notifications")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security policies and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) => updateSettings("security", "twoFactorAuth", checked)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings("security", "sessionTimeout", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSettings("security", "maxLoginAttempts", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select
                      value={settings.security.passwordPolicy}
                      onValueChange={(value) => updateSettings("security", "passwordPolicy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (8+ characters, mixed case)</SelectItem>
                        <SelectItem value="strong">Strong (12+ characters, mixed case, numbers, symbols)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                    <Textarea
                      id="ipWhitelist"
                      value={settings.security.ipWhitelist}
                      onChange={(e) => updateSettings("security", "ipWhitelist", e.target.value)}
                      rows={3}
                      placeholder="Enter IP addresses separated by commas"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("security")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="storage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Storage & File Settings
                  </CardTitle>
                  <CardDescription>Configure file upload limits and storage preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={settings.storage.maxFileSize}
                        onChange={(e) => updateSettings("storage", "maxFileSize", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                      <Input
                        id="storageLimit"
                        type="number"
                        value={settings.storage.storageLimit}
                        onChange={(e) => updateSettings("storage", "storageLimit", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                    <Input
                      id="allowedFileTypes"
                      value={settings.storage.allowedFileTypes.join(", ")}
                      onChange={(e) =>
                        updateSettings(
                          "storage",
                          "allowedFileTypes",
                          e.target.value.split(",").map((s) => s.trim()),
                        )
                      }
                      placeholder="jpg, png, gif, mp4, mov"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackup">Automatic Backup</Label>
                        <p className="text-sm text-muted-foreground">Enable automatic data backups</p>
                      </div>
                      <Switch
                        id="autoBackup"
                        checked={settings.storage.autoBackup}
                        onCheckedChange={(checked) => updateSettings("storage", "autoBackup", checked)}
                      />
                    </div>
                    {settings.storage.autoBackup && (
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                        <Select
                          value={settings.storage.backupFrequency}
                          onValueChange={(value) => updateSettings("storage", "backupFrequency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("storage")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Storage Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>Configure payment gateways and pricing settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Payment Gateways</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="stripeEnabled">Stripe</Label>
                          <p className="text-sm text-muted-foreground">Enable Stripe payment processing</p>
                        </div>
                        <Switch
                          id="stripeEnabled"
                          checked={settings.payment.stripeEnabled}
                          onCheckedChange={(checked) => updateSettings("payment", "stripeEnabled", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="paypalEnabled">PayPal</Label>
                          <p className="text-sm text-muted-foreground">Enable PayPal payment processing</p>
                        </div>
                        <Switch
                          id="paypalEnabled"
                          checked={settings.payment.paypalEnabled}
                          onCheckedChange={(checked) => updateSettings("payment", "paypalEnabled", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="razorpayEnabled">Razorpay</Label>
                          <p className="text-sm text-muted-foreground">Enable Razorpay payment processing</p>
                        </div>
                        <Switch
                          id="razorpayEnabled"
                          checked={settings.payment.razorpayEnabled}
                          onCheckedChange={(checked) => updateSettings("payment", "razorpayEnabled", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentCurrency">Payment Currency</Label>
                      <Select
                        value={settings.payment.currency}
                        onValueChange={(value) => updateSettings("payment", "currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={settings.payment.taxRate}
                        onChange={(e) => updateSettings("payment", "taxRate", Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processingFee">Processing Fee (%)</Label>
                      <Input
                        id="processingFee"
                        type="number"
                        step="0.01"
                        value={settings.payment.processingFee}
                        onChange={(e) => updateSettings("payment", "processingFee", Number.parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("payment")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Payment Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="booking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Settings
                  </CardTitle>
                  <CardDescription>Configure booking policies and requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="advanceBookingDays">Advance Booking Days</Label>
                      <Input
                        id="advanceBookingDays"
                        type="number"
                        value={settings.booking.advanceBookingDays}
                        onChange={(e) =>
                          updateSettings("booking", "advanceBookingDays", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                      <Input
                        id="depositPercentage"
                        type="number"
                        value={settings.booking.depositPercentage}
                        onChange={(e) =>
                          updateSettings("booking", "depositPercentage", Number.parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                    <Textarea
                      id="cancellationPolicy"
                      value={settings.booking.cancellationPolicy}
                      onChange={(e) => updateSettings("booking", "cancellationPolicy", e.target.value)}
                      rows={3}
                      placeholder="Enter your cancellation policy terms"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="depositRequired">Deposit Required</Label>
                        <p className="text-sm text-muted-foreground">Require a deposit for bookings</p>
                      </div>
                      <Switch
                        id="depositRequired"
                        checked={settings.booking.depositRequired}
                        onCheckedChange={(checked) => updateSettings("booking", "depositRequired", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoConfirmBookings">Auto-Confirm Bookings</Label>
                        <p className="text-sm text-muted-foreground">Automatically confirm new bookings</p>
                      </div>
                      <Switch
                        id="autoConfirmBookings"
                        checked={settings.booking.autoConfirmBookings}
                        onCheckedChange={(checked) => updateSettings("booking", "autoConfirmBookings", checked)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("booking")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Booking Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Gallery Settings
                  </CardTitle>
                  <CardDescription>Configure gallery preferences and sharing options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="watermarkEnabled">Watermark Enabled</Label>
                        <p className="text-sm text-muted-foreground">Add watermark to gallery images</p>
                      </div>
                      <Switch
                        id="watermarkEnabled"
                        checked={settings.gallery.watermarkEnabled}
                        onCheckedChange={(checked) => updateSettings("gallery", "watermarkEnabled", checked)}
                      />
                    </div>
                    {settings.gallery.watermarkEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="watermarkText">Watermark Text</Label>
                        <Input
                          id="watermarkText"
                          value={settings.gallery.watermarkText}
                          onChange={(e) => updateSettings("gallery", "watermarkText", e.target.value)}
                          placeholder="Enter watermark text"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="downloadEnabled">Download Enabled</Label>
                        <p className="text-sm text-muted-foreground">Allow clients to download images</p>
                      </div>
                      <Switch
                        id="downloadEnabled"
                        checked={settings.gallery.downloadEnabled}
                        onCheckedChange={(checked) => updateSettings("gallery", "downloadEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="socialSharingEnabled">Social Sharing Enabled</Label>
                        <p className="text-sm text-muted-foreground">Allow clients to share images on social media</p>
                      </div>
                      <Switch
                        id="socialSharingEnabled"
                        checked={settings.gallery.socialSharingEnabled}
                        onCheckedChange={(checked) => updateSettings("gallery", "socialSharingEnabled", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="passwordProtection">Password Protection</Label>
                        <p className="text-sm text-muted-foreground">Require password to access galleries</p>
                      </div>
                      <Switch
                        id="passwordProtection"
                        checked={settings.gallery.passwordProtection}
                        onCheckedChange={(checked) => updateSettings("gallery", "passwordProtection", checked)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("gallery")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Gallery Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
