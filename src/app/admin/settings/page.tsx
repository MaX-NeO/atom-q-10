"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toasts } from "@/lib/toasts"
import { Loader2, Save, Settings } from "lucide-react"
import { useAccentColor } from "@/components/providers/accent-color-provider"

interface SettingsData {
  id: string
  siteTitle: string
  siteDescription: string
  maintenanceMode: boolean
  allowRegistration: boolean
  enableGithubAuth: boolean
  accentColor: string
  createdAt: string
  updatedAt: string
}

const colorOptions = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "pink", label: "Pink", color: "bg-pink-500" },
]

export default function SettingsPage() {
  const { setAccentColor } = useAccentColor()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    siteTitle: "",
    siteDescription: "",
    maintenanceMode: false,
    allowRegistration: true,
    enableGithubAuth: false,
    accentColor: "blue"
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setFormData({
          siteTitle: data.siteTitle,
          siteDescription: data.siteDescription,
          maintenanceMode: data.maintenanceMode,
          allowRegistration: data.allowRegistration,
          enableGithubAuth: data.enableGithubAuth,
          accentColor: data.accentColor
        })
      }
    } catch (error) {
      toasts.networkError()
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setAccentColor(updatedSettings.accentColor)
        toasts.settingsUpdated()
        
        // Show specific toasts for maintenance mode changes
        if (formData.maintenanceMode !== updatedSettings.maintenanceMode) {
          if (updatedSettings.maintenanceMode) {
            toasts.maintenanceModeEnabled()
          } else {
            toasts.maintenanceModeDisabled()
          }
        }
      } else {
        toasts.actionFailed("Settings update")
      }
    } catch (error) {
      toasts.actionFailed("Settings update")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Site Title</Label>
              <Input
                id="siteTitle"
                value={formData.siteTitle}
                onChange={(e) => handleInputChange("siteTitle", e.target.value)}
                placeholder="Enter site title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <Select value={formData.accentColor} onValueChange={(value) => handleInputChange("accentColor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accent color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${color.color}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Settings</CardTitle>
            <CardDescription>
              Configure user authentication options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Enable new users to register on the site
                </p>
              </div>
              <Switch
                checked={formData.allowRegistration}
                onCheckedChange={(checked) => handleInputChange("allowRegistration", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable GitHub Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to sign in with GitHub
                </p>
              </div>
              <Switch
                checked={formData.enableGithubAuth}
                onCheckedChange={(checked) => handleInputChange("enableGithubAuth", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              System-wide configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <Switch
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>

            {formData.maintenanceMode && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Maintenance mode is enabled. Only administrators can access the site.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Last Updated Info */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Settings Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-1">
              <p>Last updated: {new Date(settings.updatedAt).toLocaleString()}</p>
              <p>Created: {new Date(settings.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}