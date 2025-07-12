"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { authClient, useSession, changePassword } from "@/lib/auth/client"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const { data: session, isPending, refetch } = useSession()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string

      // Update profile using better-auth
      await authClient.updateUser({
        name: name,
      })
      
      // Handle image upload if present
      if (imageFile) {
        // TODO: Implement image upload logic
      }

      await refetch() // Refresh session data after update
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const currentPassword = formData.get("currentPassword") as string
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Update password using better-auth
      await changePassword({
        currentPassword,
        newPassword,
      })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      
      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-[200px] bg-muted rounded"></div>
          <div className="h-[200px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <Card className="p-6">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview || session.user?.image || "/placeholder-avatar.png"} />
                <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute bottom-0 right-0"
                onClick={() => document.getElementById("avatar")?.click()}
              >
                Change
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
              <p className="text-sm text-muted-foreground">
                Update your profile information and email address.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Your name" 
                defaultValue={session.user?.name || ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="Your email" 
                defaultValue={session.user?.email || ""}
                disabled
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Ensure your account is using a secure password.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
              />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  )
} 