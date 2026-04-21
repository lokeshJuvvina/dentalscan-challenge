import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CHALLENGE: MESSAGING SYSTEM
 * 
 * Your goal is to build a basic communication channel between the Patient and Dentist.
 * 1. Implement the POST handler to save a new message into a Thread.
 * 2. Implement the GET handler to retrieve message history for a given thread.
 * 3. Focus on data integrity and proper relations.
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");
    const patientId = searchParams.get("patientId");

    // Support fetching by threadId or patientId
    if (!threadId && !patientId) {
      return NextResponse.json(
        { error: "Either threadId or patientId is required" },
        { status: 400 }
      );
    }

    if (threadId) {
      // Fetch messages for specific thread
      const messages = await prisma.message.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" },
      });

      const thread = await prisma.thread.findUnique({
        where: { id: threadId },
      });

      return NextResponse.json({ messages, thread });
    } else if (patientId) {
      // Find or create thread for patient
      let thread = await prisma.thread.findFirst({
        where: { patientId },
      });

      if (!thread) {
        thread = await prisma.thread.create({
          data: { patientId },
        });
      }

      const messages = await prisma.message.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ messages, thread });
    }

    return NextResponse.json({ messages: [] });
  } catch (err) {
    console.error("Get Messages Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, patientId, content, sender } = body;

    // Validate required fields
    if (!content || !sender) {
      return NextResponse.json(
        { error: "content and sender are required" },
        { status: 400 }
      );
    }

    if (!["patient", "dentist"].includes(sender)) {
      return NextResponse.json(
        { error: "sender must be either 'patient' or 'dentist'" },
        { status: 400 }
      );
    }

    let finalThreadId = threadId;

    // If no threadId provided, find or create thread for patient
    if (!finalThreadId && patientId) {
      let thread = await prisma.thread.findFirst({
        where: { patientId },
      });

      if (!thread) {
        thread = await prisma.thread.create({
          data: { patientId },
        });
      }

      finalThreadId = thread.id;
    }

    if (!finalThreadId) {
      return NextResponse.json(
        { error: "Either threadId or patientId is required" },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: finalThreadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        threadId: finalThreadId,
        content,
        sender,
      },
    });

    // Update thread timestamp
    await prisma.thread.update({
      where: { id: finalThreadId },
      data: { updatedAt: new Date() },
    });

    console.log(`✓ Message created in thread ${finalThreadId} by ${sender}`);

    return NextResponse.json({ ok: true, message, threadId: finalThreadId });
  } catch (err) {
    console.error("Messaging API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
