'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

const routes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: ImageIcon,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <ImageIcon className="h-6 w-6" />
        <span className="font-bold">AutoCaption</span>
      </Link>
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant="ghost"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === route.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}