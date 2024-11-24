import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const captions = await prisma.caption.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(captions);
  } catch (error) {
    console.error("[CAPTIONS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}