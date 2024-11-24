import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { CaptionHistory } from "@/components/dashboard/caption-history";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Generate captions for your images using AI.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <ImageUpload />
        <CaptionHistory />
      </div>
    </div>
  );
}