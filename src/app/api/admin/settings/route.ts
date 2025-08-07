
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get settings, create default if not exists
    let settings = await db.settings.findFirst()
    
    if (!settings) {
      settings = await db.settings.create({
        data: {}
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      siteTitle,
      siteDescription,
      maintenanceMode,
      allowRegistration,
      enableGithubAuth,
      accentColor
    } = body

    // Get existing settings or create new
    let settings = await db.settings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          siteTitle,
          siteDescription,
          maintenanceMode,
          allowRegistration,
          enableGithubAuth,
          accentColor
        }
      })
    } else {
      // Create new settings
      settings = await db.settings.create({
        data: {
          siteTitle,
          siteDescription,
          maintenanceMode,
          allowRegistration,
          enableGithubAuth,
          accentColor
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
