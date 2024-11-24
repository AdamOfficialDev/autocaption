import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import axios from "axios";

const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";

let ffmpeg: FFmpeg | null = null;

async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

export async function extractAudio(videoUrl: string): Promise<string> {
  const ffmpeg = await initFFmpeg();
  
  // Download video file
  const videoResponse = await fetch(videoUrl);
  const videoData = await videoResponse.arrayBuffer();
  
  // Write video file to FFmpeg's virtual filesystem
  await ffmpeg.writeFile("input.mp4", new Uint8Array(videoData));
  
  // Extract audio
  await ffmpeg.exec([
    "-i", "input.mp4",
    "-vn", // Disable video
    "-acodec", "libmp3lame",
    "-ar", "16000", // Sample rate required by Whisper
    "-ac", "1", // Mono audio
    "-b:a", "192k",
    "output.mp3"
  ]);
  
  // Read the audio file
  const audioData = await ffmpeg.readFile("output.mp3");
  const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
  
  // Upload to uploadthing and return URL
  // Note: You'll need to implement this part using your upload service
  return URL.createObjectURL(audioBlob);
}

export async function transcribeAudio(audioUrl: string) {
  try {
    const response = await axios.post(
      API_URL,
      { inputs: audioUrl },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transcript = response.data.text;
    
    // Convert transcript to SRT format
    const subtitles = generateSRT(response.data.chunks);

    return { transcript, subtitles };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

function generateSRT(chunks: any[]): string {
  return chunks
    .map((chunk, index) => {
      const start = formatTimestamp(chunk.timestamp[0]);
      const end = formatTimestamp(chunk.timestamp[1]);
      return `${index + 1}\n${start} --> ${end}\n${chunk.text}\n\n`;
    })
    .join("");
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)},${padZero(ms, 3)}`;
}

function padZero(num: number, width: number = 2): string {
  return num.toString().padStart(width, "0");
}