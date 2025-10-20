"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  Settings,
  User,
  Bell,
  Lock,
  Eye,
  CreditCard,
  Shield,
  Save,
  RefreshCw,
  Camera,
  Mail,
  Phone,
  MapPin,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface ClientSettings {
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    bio: string
    avatar: string
    website: string
    socialMedia: {
      instagram: string
      facebook: string
      twitter: string
    }
  }
  preferences: {
    timezone: string
    language: string
    currency: string
    dateFormat: string
    emailDigest: boolean
    marketingEmails: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    bookingUpdates: boolean
    galleryUpdates: boolean
    paymentUpdates: boolean
    promotionalOffers: boolean
  }
  privacy: {
    profileVisibility: string
    galleryVisibility: string
    allowDownloads: boolean
    allowSocialSharing: boolean
    showInDirectory: boolean
    dataProcessingConsent: boolean
  }
  security: {
    twoFactorAuth: boolean
    loginAlerts: boolean
    sessionTimeout: number
    passwordLastChanged: string
  }
  billing: {
    defaultPaymentMethod: string
    billingAddress: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    invoiceEmail: string
    autoPayment: boolean
  }
}

export default function ClientSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<ClientSettings>({
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      bio: "",
      avatar: "",
      website: "",
      socialMedia: {
        instagram: "",
        facebook: "",
        twitter: "",
      },
    },
    preferences: {
      timezone: "UTC",
      language: "en",
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      emailDigest: true,
      marketingEmails: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      bookingUpdates: true,
      galleryUpdates: true,
      paymentUpdates: true,
      promotionalOffers: false,
    },
    privacy: {
      profileVisibility: "public",
      galleryVisibility: "private",
      allowDownloads: true,
      allowSocialSharing: true,
      showInDirectory: false,
      dataProcessingConsent: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordLastChanged: new Date().toISOString(),
    },
    billing: {
      defaultPaymentMethod: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      invoiceEmail: "",
      autoPayment: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (session?.user) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          firstName: session.user.name?.split(" ")[0] || "",
          lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
          email: session.user.email || "",
          avatar: session.user.image || "",
        },
      }))
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleSave = async (section: keyof ClientSettings) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/client/settings/${section}`, {
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

  const updateSettings = (section: keyof ClientSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const updateNestedSettings = (section: keyof ClientSettings, parentKey: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...(prev[section] as any)[parentKey],
          [key]: value,
        },
      },
    }))
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to access your settings.</p>
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
              <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <User className="h-4 w-4 mr-1" />
              Client Account
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={settings.profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {settings.profile.firstName.charAt(0)}
                        {settings.profile.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={settings.profile.firstName}
                        onChange={(e) => updateSettings("profile", "firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={settings.profile.lastName}
                        onChange={(e) => updateSettings("profile", "lastName", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSettings("profile", "email", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={settings.profile.phone}
                          onChange={(e) => updateSettings("profile", "phone", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settings.profile.bio}
                      onChange={(e) => updateSettings("profile", "bio", e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.profile.website}
                      onChange={(e) => updateSettings("profile", "website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Social Media</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={settings.profile.socialMedia.instagram}
                          onChange={(e) => updateNestedSettings("profile", "socialMedia", "instagram", e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={settings.profile.socialMedia.facebook}
                          onChange={(e) => updateNestedSettings("profile", "socialMedia", "facebook", e.target.value)}
                          placeholder="facebook.com/username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={settings.profile.socialMedia.twitter}
                          onChange={(e) => updateNestedSettings("profile", "socialMedia", "twitter", e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label>Address Information</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="address"
                            value={settings.profile.address}
                            onChange={(e) => updateSettings("profile", "address", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={settings.profile.city}
                            onChange={(e) => updateSettings("profile", "city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={settings.profile.state}
                            onChange={(e) => updateSettings("profile", "state", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={settings.profile.zipCode}
                            onChange={(e) => updateSettings("profile", "zipCode", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={settings.profile.country}
                            onValueChange={(value) => updateSettings("profile", "country", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="NG">Nigeria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("profile")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription>Customize your experience and display preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.preferences.timezone}
                        onValueChange={(value) => updateSettings("preferences", "timezone", value)}
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
                        value={settings.preferences.language}
                        onValueChange={(value) => updateSettings("preferences", "language", value)}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={settings.preferences.currency}
                        onValueChange={(value) => updateSettings("preferences", "currency", value)}
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
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={settings.preferences.dateFormat}
                        onValueChange={(value) => updateSettings("preferences", "dateFormat", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Email Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailDigest">Email Digest</Label>
                          <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
                        </div>
                        <Switch
                          id="emailDigest"
                          checked={settings.preferences.emailDigest}
                          onCheckedChange={(checked) => updateSettings("preferences", "emailDigest", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketingEmails">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
                        </div>
                        <Switch
                          id="marketingEmails"
                          checked={settings.preferences.marketingEmails}
                          onCheckedChange={(checked) => updateSettings("preferences", "marketingEmails", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("preferences")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Preferences
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
                  <CardDescription>Choose how and when you want to be notified</CardDescription>
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
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="bookingUpdates">Booking Updates</Label>
                          <p className="text-sm text-muted-foreground">Updates about your bookings and appointments</p>
                        </div>
                        <Switch
                          id="bookingUpdates"
                          checked={settings.notifications.bookingUpdates}
                          onCheckedChange={(checked) => updateSettings("notifications", "bookingUpdates", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="galleryUpdates">Gallery Updates</Label>
                          <p className="text-sm text-muted-foreground">When new photos are added to your galleries</p>
                        </div>
                        <Switch
                          id="galleryUpdates"
                          checked={settings.notifications.galleryUpdates}
                          onCheckedChange={(checked) => updateSettings("notifications", "galleryUpdates", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="paymentUpdates">Payment Updates</Label>
                          <p className="text-sm text-muted-foreground">Payment confirmations and receipts</p>
                        </div>
                        <Switch
                          id="paymentUpdates"
                          checked={settings.notifications.paymentUpdates}
                          onCheckedChange={(checked) => updateSettings("notifications", "paymentUpdates", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="promotionalOffers">Promotional Offers</Label>
                          <p className="text-sm text-muted-foreground">Special offers and discounts</p>
                        </div>
                        <Switch
                          id="promotionalOffers"
                          checked={settings.notifications.promotionalOffers}
                          onCheckedChange={(checked) => updateSettings("notifications", "promotionalOffers", checked)}
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

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value) => updateSettings("privacy", "profileVisibility", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="galleryVisibility">Gallery Visibility</Label>
                      <Select
                        value={settings.privacy.galleryVisibility}
                        onValueChange={(value) => updateSettings("privacy", "galleryVisibility", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="password">Password Protected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Content Permissions</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowDownloads">Allow Downloads</Label>
                          <p className="text-sm text-muted-foreground">Allow visitors to download your photos</p>
                        </div>
                        <Switch
                          id="allowDownloads"
                          checked={settings.privacy.allowDownloads}
                          onCheckedChange={(checked) => updateSettings("privacy", "allowDownloads", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowSocialSharing">Allow Social Sharing</Label>
                          <p className="text-sm text-muted-foreground">Allow sharing of your content on social media</p>
                        </div>
                        <Switch
                          id="allowSocialSharing"
                          checked={settings.privacy.allowSocialSharing}
                          onCheckedChange={(checked) => updateSettings("privacy", "allowSocialSharing", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showInDirectory">Show in Directory</Label>
                          <p className="text-sm text-muted-foreground">Include your profile in public directory</p>
                        </div>
                        <Switch
                          id="showInDirectory"
                          checked={settings.privacy.showInDirectory}
                          onCheckedChange={(checked) => updateSettings("privacy", "showInDirectory", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Data Processing</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dataProcessingConsent">Data Processing Consent</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow processing of your data for service improvement
                        </p>
                      </div>
                      <Switch
                        id="dataProcessingConsent"
                        checked={settings.privacy.dataProcessingConsent}
                        onCheckedChange={(checked) => updateSettings("privacy", "dataProcessingConsent", checked)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("privacy")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Privacy Settings
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
                  <CardDescription>Manage your account security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={settings.security.twoFactorAuth}
                        onCheckedChange={(checked) => updateSettings("security", "twoFactorAuth", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="loginAlerts">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                      </div>
                      <Switch
                        id="loginAlerts"
                        checked={settings.security.loginAlerts}
                        onCheckedChange={(checked) => updateSettings("security", "loginAlerts", checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings("security", "sessionTimeout", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Password</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Password Last Changed</Label>
                          <p className="text-sm text-muted-foreground">
                            {new Date(settings.security.passwordLastChanged).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                    </div>
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

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Payment
                  </CardTitle>
                  <CardDescription>Manage your payment methods and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
                    <Select
                      value={settings.billing.defaultPaymentMethod}
                      onValueChange={(value) => updateSettings("billing", "defaultPaymentMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceEmail">Invoice Email</Label>
                    <Input
                      id="invoiceEmail"
                      type="email"
                      value={settings.billing.invoiceEmail}
                      onChange={(e) => updateSettings("billing", "invoiceEmail", e.target.value)}
                      placeholder="billing@example.com"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoPayment">Automatic Payment</Label>
                      <p className="text-sm text-muted-foreground">Automatically pay invoices when due</p>
                    </div>
                    <Switch
                      id="autoPayment"
                      checked={settings.billing.autoPayment}
                      onCheckedChange={(checked) => updateSettings("billing", "autoPayment", checked)}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Label>Billing Address</Label>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingStreet">Street Address</Label>
                        <Input
                          id="billingStreet"
                          value={settings.billing.billingAddress.street}
                          onChange={(e) => updateNestedSettings("billing", "billingAddress", "street", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingCity">City</Label>
                          <Input
                            id="billingCity"
                            value={settings.billing.billingAddress.city}
                            onChange={(e) => updateNestedSettings("billing", "billingAddress", "city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingState">State</Label>
                          <Input
                            id="billingState"
                            value={settings.billing.billingAddress.state}
                            onChange={(e) => updateNestedSettings("billing", "billingAddress", "state", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingZipCode">ZIP Code</Label>
                          <Input
                            id="billingZipCode"
                            value={settings.billing.billingAddress.zipCode}
                            onChange={(e) =>
                              updateNestedSettings("billing", "billingAddress", "zipCode", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingCountry">Country</Label>
                          <Select
                            value={settings.billing.billingAddress.country}
                            onValueChange={(value) =>
                              updateNestedSettings("billing", "billingAddress", "country", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="NG">Nigeria</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave("billing")} disabled={loading}>
                      {loading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Billing Settings
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
