"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { TheoryView } from "@/components/theory-view";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Construction } from "lucide-react";

export default function ModuleTheoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isModuleAvailable, isLoaded } = useProgress();

  const mod = getModuleById(id);

  if (!mod) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Модуль не найден</p>
      </div>
    );
  }

  if (isLoaded && !isModuleAvailable(id)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">
          Пройдите предыдущий модуль, чтобы открыть этот
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          К началу
        </Button>
      </div>
    );
  }

  if (mod.comingSoon) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">{mod.title}</h1>
        <div className="mt-16 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 px-8 py-16 text-center">
          <Construction className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Информация в модуле появится позже
          </p>
          <p className="text-sm text-muted-foreground/60">
            Мы работаем над материалами для этого модуля. Следите за обновлениями!
          </p>
        </div>
        <div className="mt-12 flex justify-start border-t pt-6">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            К списку модулей
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <TheoryView content={mod.theory} />

      <div className="mt-12 flex justify-end border-t pt-6">
        <Button
          size="lg"
          onClick={() => router.push(`/module/${id}/practice`)}
          className="gap-2"
        >
          Перейти к заданию
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
