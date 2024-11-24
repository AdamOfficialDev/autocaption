import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractAudio, transcribeAudio } from "@/lib/transcription";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return new NextResponse("Video URL is required", { status: 400 });
    }

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.credits <= 0) {
      return new NextResponse("Insufficient credits", { status: 402 });
    }

    // Create initial caption record
    const caption = await prisma.caption.create({
      data: {
        userId,
        videoUrl,
        transcript: "",
        subtitles: "",
        status: "PROCESSING",
      },
    });

    // Extract audio from video
    const audioUrl = await extractAudio(videoUrl);

    // Update caption with audio URL
    await prisma.caption.update({
      where: { id: caption.id },
      data: { audioUrl },
    });

    // Transcribe audio
    const { transcript, subtitles } = await transcribeAudio(audioUrl);

    // Update caption with results
    const updatedCaption = await prisma.caption.update({
      where: { id: caption.id },
      data: {
        transcript,
        subtitles,
        status: "COMPLETED",
      },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    return NextResponse.json(updatedCaption);
  } catch (error) {
    console.error("[TRANSCRIBE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}