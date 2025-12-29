import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId"); 
    const currentUserId = (session.user as any).id;

    if (!contactId) return NextResponse.json({ error: "Contact ID required" }, { status: 400 });


    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: contactId },
          { senderId: contactId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" }, 
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Chat GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { text, receiverId } = body;
    const senderId = (session.user as any).id;

    if (!text || !receiverId) {
      return NextResponse.json({ error: "Text and Receiver ID required" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
        isRead: false,
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Chat POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}