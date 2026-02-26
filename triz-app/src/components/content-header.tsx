"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Курс", href: "/module/module-1", match: "/module" },
  { label: "Тренажёр", href: "/trainer", match: "/trainer" },
];

export function ContentHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <nav className="flex items-center justify-center gap-8 px-6 h-12">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative py-3 text-sm font-medium transition-colors hover:text-foreground",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
