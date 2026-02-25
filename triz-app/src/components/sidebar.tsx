"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Lock,
  BookOpen,
  FileText,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { modules } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SubItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isLocked: boolean;
}

function stripSectionPrefix(title: string): string {
  return title
    .replace(/^Практика:\s*/i, "")
    .replace(/^Практикум\s*\d+\.\d+:\s*/i, "");
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    isModuleCompleted,
    isModuleAvailable,
    getModuleProgress,
    isLoaded,
  } = useProgress();

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const ready = hasMounted && isLoaded;

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-5 py-5">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">ТРИЗ-тренажёр</h1>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Учебная программа
        </p>
        <nav className="flex flex-col gap-1">
          {modules.map((mod, idx) => {
            const available = ready ? isModuleAvailable(mod.id) : idx === 0;
            const completed = ready ? isModuleCompleted(mod.id) : false;
            const mp = ready ? getModuleProgress(mod.id) : undefined;
            const isCurrent = pathname.startsWith(`/module/${mod.id}`);

            const shortTitle = mod.title.replace(/^Модуль \d+:\s*/, "");

            const hasExercises =
              mod.practiceExercises && mod.practiceExercises.length > 0;
            const hasMultipleSections = mod.practiceSections.length > 1;

            const subItems: SubItem[] = [
              {
                label: "Теория",
                href: `/module/${mod.id}`,
                icon: <FileText className="h-3.5 w-3.5" />,
                isCompleted: false,
                isLocked: false,
              },
            ];

            if (!mod.comingSoon) {
              if (hasExercises || mod.practiceSections.length <= 1) {
                subItems.push({
                  label: "Задание",
                  href: `/module/${mod.id}/practice`,
                  icon: <ClipboardList className="h-3.5 w-3.5" />,
                  isCompleted: false,
                  isLocked: false,
                });
              }

              if (hasMultipleSections) {
                mod.practiceSections.forEach((section, sIdx) => {
                  subItems.push({
                    label: stripSectionPrefix(section.title),
                    href: `/module/${mod.id}/practice?s=${sIdx}`,
                    icon: <ClipboardList className="h-3.5 w-3.5" />,
                    isCompleted: false,
                    isLocked: false,
                  });
                });
              }

              subItems.push({
                label: "Тест",
                href: `/module/${mod.id}/test`,
                icon: <GraduationCap className="h-3.5 w-3.5" />,
                isCompleted: completed,
                isLocked: false,
              });
            }

            if (!available) {
              return (
                <div
                  key={mod.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/50 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground/40">
                      Модуль {idx + 1}
                    </p>
                    <p className="break-words text-sm">{shortTitle}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={mod.id} className="flex flex-col">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    isCurrent && "bg-accent/50"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                        isCurrent
                          ? "border-primary text-primary"
                          : "border-muted-foreground/40 text-muted-foreground/40"
                      )}
                    >
                      {idx + 1}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Модуль {idx + 1}
                    </p>
                    <p className="break-words text-sm font-medium">{shortTitle}</p>
                  </div>
                  {completed && mp && mp.totalQuestions > 0 && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs text-emerald-700 bg-emerald-50"
                    >
                      {Math.round((mp.bestScore / mp.totalQuestions) * 100)}%
                    </Badge>
                  )}
                </div>

                <div className="ml-5 border-l pl-4 mt-1 mb-2 flex flex-col gap-0.5">
                  {subItems.map((sub) => {
                    const currentSection = searchParams.get("s");
                    const subUrl = new URL(sub.href, "http://x");
                    const subSection = subUrl.searchParams.get("s");
                    const subPath = subUrl.pathname;

                    const isSubActive =
                      (sub.href === pathname && !sub.href.includes("?")) ||
                      (subPath === pathname &&
                        subSection !== null &&
                        currentSection === subSection) ||
                      (sub.href.endsWith("/test") &&
                        pathname === `/module/${mod.id}/results`) ||
                      (sub.href === `/module/${mod.id}/practice` &&
                        !hasMultipleSections &&
                        pathname === `/module/${mod.id}/practice/results`);

                    if (sub.isLocked) {
                      return (
                        <div
                          key={sub.href}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground/40 cursor-not-allowed"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span className="text-xs break-words min-w-0">{sub.label}</span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                          isSubActive && "bg-accent font-medium"
                        )}
                      >
                        {sub.isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <span
                            className={cn(
                              "text-muted-foreground/60",
                              isSubActive && "text-primary"
                            )}
                          >
                            {sub.icon}
                          </span>
                        )}
                        <span className="text-xs break-words min-w-0">{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="px-5 py-3">
        <p className="text-xs text-muted-foreground">
          {ready
            ? `Пройдено: ${modules.filter((m) => isModuleCompleted(m.id)).length} / ${modules.length}`
            : "Загрузка..."}
        </p>
      </div>
    </aside>
  );
}
