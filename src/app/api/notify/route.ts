import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CHALLENGE: NOTIFICATION SYSTEM
 *
 * Your goal is to implement a robust notification logic.
 * 1. When a scan is "completed", create a record in the Notification table.
 * 2. Return a success status to the client.
 * 3. Bonus: Handle potential errors (e.g., database connection issues).
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Fetch all notifications for the user, sorted by most recent
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scanId, status, userId } = body;

    // Validate required fields
    if (!scanId) {
      return NextResponse.json({ error: "scanId is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (status === "completed") {
      // Create or update scan status
      const scan = await prisma.scan.upsert({
        where: { id: scanId },
        update: { status: "completed" },
        create: { id: scanId, status: "completed" },
      });

      // Create notification asynchronously (non-blocking)
      // Using Promise.resolve() to demonstrate async flow without blocking response
      Promise.resolve().then(async () => {
        try {
          await prisma.notification.create({
            data: {
              userId,
              title: "Scan Completed",
              message: `Your dental scan has been completed successfully. Scan ID: ${scanId}`,
              read: false,
            },
          });

          console.log(`✓ Notification created for user ${userId}, scan ${scanId}`);

          // In production, this would trigger external notification service
          // e.g., Twilio SMS, push notification, email, etc.
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
          // Log error but don't fail the request since scan is already updated
        }
      });

      return NextResponse.json({
        ok: true,
        message: "Scan completed and notification triggered",
        scanId: scan.id,
      });
    }

    // Handle other status updates
    if (status) {
      await prisma.scan.update({
        where: { id: scanId },
        data: { status },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification API Error:", err);

    // Check for specific Prisma errors
    if (err instanceof Error) {
      if (err.message.includes("Record to update not found")) {
        return NextResponse.json({ error: "Scan not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
