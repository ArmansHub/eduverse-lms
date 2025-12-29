import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teacherId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const chatWithId = searchParams.get("chatWith");

    if (chatWithId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: teacherId, receiverId: chatWithId },
            { senderId: chatWithId, receiverId: teacherId }
          ]
        },
        orderBy: { createdAt: "asc" }, 
      });
      return NextResponse.json(messages);
    }

    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: teacherId }, { receiverId: teacherId }]
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const uniqueContactsMap = new Map();
    
    conversations.forEach((msg) => {
      const otherUser = msg.senderId === teacherId ? msg.receiver : msg.sender;
      if (!uniqueContactsMap.has(otherUser.id)) {
        uniqueContactsMap.set(otherUser.id, {
          ...otherUser,
          lastMessage: msg.text,
          time: msg.createdAt
        });
      }
    });

    return NextResponse.json(Array.from(uniqueContactsMap.values()));

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const senderId = (session.user as any).id;
    const { receiverId, text } = await req.json();

    if (!receiverId || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId
      }
    });

    return NextResponse.json(newMessage);

  } catch (error) {
    return NextResponse.json({ error: "Message failed" }, { status: 500 });
  }
}