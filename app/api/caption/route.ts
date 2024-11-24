import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCaption } from "@/lib/huggingface";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    // Generate caption
    const caption = await generateCaption(imageUrl);

    // Save caption to database
    const savedCaption = await prisma.caption.create({
      data: {
        userId,
        imageUrl,
        caption,
      },
    });

    return NextResponse.json(savedCaption);
  } catch (error) {
    console.error("[CAPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}