"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Video, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const { startUpload } = useUploadThing("videoUploader", {
    onUploadProgress: (progress) => {
      setProgress(progress);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB",
        variant: "destructive",
      });
      return;
    }
    setFile(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    maxFiles: 1,
    onDrop,
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const [res] = await startUpload([file]);
      
      if (!res) {
        throw new Error("Upload failed");
      }

      // Start transcription process
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: res.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      toast({
        title: "Video uploaded successfully",
        description: "Your video is being processed. This may take a few minutes.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input {...getInputProps()} />
        <Video className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the video here"
            : "Drag & drop a video here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Maximum file size: 100MB
        </p>
      </div>
      {file && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium">Selected file:</p>
            <p className="text-sm text-muted-foreground">{file.name}</p>
          </div>
          {uploading && (
            <Progress value={progress} className="h-2" />
          )}
          <Button 
            className="w-full" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Generate Captions"}
          </Button>
        </div>
      )}
    </Card>
  );
}