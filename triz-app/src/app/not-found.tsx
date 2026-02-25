"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <BookOpen className="h-12 w-12 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold">Страница не найдена</h1>
      <p className="text-muted-foreground">
        Такой страницы не существует. Вернитесь к учебной программе.
      </p>
      <Button onClick={() => router.push("/")}>На главную</Button>
    </div>
  );
}
