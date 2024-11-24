"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";

export function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { startUpload } = useUploadThing("imageUploader");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024, // 4MB
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 4MB",
          variant: "destructive",
        });
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const [res] = await startUpload([file]);
      
      if (!res) {
        throw new Error("Upload failed");
      }

      // Generate caption
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: res.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Caption generation failed");
      }

      toast({
        title: "Success",
        description: "Image uploaded and caption generated successfully.",
      });

      // Reset state
      setFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the image here"
            : "Drag & drop an image here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Maximum file size: 4MB
        </p>
      </div>
      {file && (
        <div className="mt-4">
          <p className="text-sm font-medium">Selected file:</p>
          <p className="text-sm text-muted-foreground">{file.name}</p>
          <Button 
            className="mt-2 w-full" 
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Generating Caption..." : "Generate Caption"}
          </Button>
        </div>
      )}
    </Card>
  );
}