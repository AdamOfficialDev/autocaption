"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Caption {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

async function fetchCaptions(): Promise<Caption[]> {
  const response = await fetch("/api/captions");
  if (!response.ok) {
    throw new Error("Failed to fetch captions");
  }
  return response.json();
}

export function CaptionHistory() {
  const { data: captions, isLoading } = useQuery({
    queryKey: ["captions"],
    queryFn: fetchCaptions,
  });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Recent Captions</h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : captions?.length ? (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {captions.map((caption) => (
              <div
                key={caption.id}
                className="p-4 rounded-lg border bg-card text-card-foreground"
              >
                <div className="aspect-video relative mb-2 rounded-md overflow-hidden">
                  <img
                    src={caption.imageUrl}
                    alt="Uploaded image"
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm">{caption.caption}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(caption.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <p className="text-sm text-muted-foreground">
          Your generated captions will appear here.
        </p>
      )}
    </Card>
  );
}