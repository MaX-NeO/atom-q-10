"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toasts } from "@/lib/toasts"
import { Loader2, Save, Upload, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserRole } from "@prisma/client"

// Assuming these imports are available for Zustand stores and User type
// import { useUserStore } from "@/stores/userStore";
// import { useQuizStore } from "@/stores/quizStore";

// Mock types and stores for demonstration if they are not provided
interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
}

import { useUserStore } from "@/stores/user"
import { useQuizCacheStore } from "@/stores/quiz-cache"


interface UserProfile {
  name?: string
  email: string
  phone?: string
  avatar?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function UserSettingsPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const { user: storeUser, updateUser } = useUserStore()
  const { clearCache } = useQuizCacheStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  })
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Handle authentication check first
  useEffect(() => {
    if (!session || session.user.role !== UserRole.USER) {
      router.push("/")
    }
  }, [session, router])

  useEffect(() => {
    if (session) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email,
        phone: session.user.phone || "",
        avatar: session.user.avatar || "",
      })
      setLoading(false)
    }
  }, [session])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          avatar: profile.avatar,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedUserData = await response.json()
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        name: updatedUserData.name,
        phone: updatedUserData.phone,
        avatar: updatedUserData.avatar,
      }));

      // Update user store
      updateUser({
        name: updatedUserData.name,
        phone: updatedUserData.phone,
        avatar: updatedUserData.avatar,
      })

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: updatedUserData.name,
          phone: updatedUserData.phone,
          avatar: updatedUserData.avatar,
        }
      })

      toasts.profileUpdated()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toasts.actionFailed(error.message || "Profile update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For demo purposes, we'll just show a success message and update local state
    // In a real app, you would upload the file to a server and then update profile/session
    const reader = new FileReader();
    reader.onloadend = () => {
      const avatarUrl = reader.result as string;
      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      // Simulate updating session and store for avatar as well
      updateUser({ avatar: avatarUrl });
      updateSession({
        ...session,
        user: {
          ...session?.user,
          avatar: avatarUrl,
        }
      });
      toasts.avatarUpdated();
    };
    reader.readAsDataURL(file);
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toasts.actionFailed("Password confirmation doesn't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toasts.actionFailed("Password must be at least 6 characters")
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toasts.passwordChanged()
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const error = await response.json()
        toasts.actionFailed(error.message || "Password change failed")
      }
    } catch (error) {
      toasts.actionFailed("Password change failed")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== UserRole.USER) {
    return null
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar || session.user.avatar} alt={profile.name || session.user.name} />
                <AvatarFallback className="text-lg">
                  {profile.name?.charAt(0).toUpperCase() || session.user.name?.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

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
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
              <p className="text-sm">{session?.user.role}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
              <p className="text-sm">
                {session?.user.name ? "User account" : "Recently created"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password for security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter your new password"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience and notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Additional preferences and notification settings will be available in future updates.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}