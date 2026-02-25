"use client";

import { use, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

export default function PracticeResultsPageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <PracticeResultsPage params={params} />
    </Suspense>
  );
}

function PracticeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getModuleProgress, isLoaded } = useProgress();

  const mod = getModuleById(id);
  const mp = isLoaded ? getModuleProgress(id) : undefined;

  const hasMultipleSections =
    mod?.practiceSections && mod.practiceSections.length > 1;
  const sectionIndex = hasMultipleSections
    ? parseInt(searchParams.get("s") || "0", 10)
    : null;
  const currentSection =
    sectionIndex !== null && mod
      ? mod.practiceSections[sectionIndex] ?? null
      : null;

  const sectionsToShow = useMemo(() => {
    if (!mod) return [];
    if (currentSection) return [currentSection];
    return mod.practiceSections;
  }, [mod, currentSection]);

  const allQuestions = useMemo(() => {
    return sectionsToShow.flatMap((s) => s.questions);
  }, [sectionsToShow]);

  if (!mod) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Модуль не найден</p>
      </div>
    );
  }

  if (!isLoaded || !mp || !mp.practiceResults) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">
          {isLoaded ? "Сначала выполните задание" : "Загрузка..."}
        </p>
      </div>
    );
  }

  const score = allQuestions.filter(
    (q) => mp.practiceResults?.[q.id]
  ).length;
  const total = allQuestions.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const practiceBackUrl =
    sectionIndex !== null
      ? `/module/${id}/practice?s=${sectionIndex}`
      : `/module/${id}/practice`;

  const nextSectionIndex =
    sectionIndex !== null && mod.practiceSections.length > sectionIndex + 1
      ? sectionIndex + 1
      : null;

  const sectionTitle = currentSection?.title ?? "Задание";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-xl">Задание выполнено</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {sectionTitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold tabular-nums">{percent}%</div>
            <div className="mb-1 text-sm text-muted-foreground">
              {score} из {total} правильных ответов
            </div>
          </div>
          <Progress value={percent} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Ознакомьтесь с разбором ответов ниже.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Разбор ответов</h2>
        <Separator className="my-4" />

        {sectionsToShow.map((section) => (
          <div key={section.id} className="mb-6">
            {!currentSection && (
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {section.title}
              </h3>
            )}
            <Accordion type="multiple" className="space-y-2">
              {section.questions.map((q, qIdx) => {
                const isCorrect = mp.practiceResults?.[q.id] ?? false;
                const userAnswer = mp.practiceAnswers?.[q.id] || "";

                const userAnswerLabel =
                  q.type === "mc" && q.options
                    ? q.options.find((o) => o.id === userAnswer)?.label ||
                      "Не отвечено"
                    : userAnswer || "Не отвечено";

                const correctLabel =
                  q.type === "mc" && q.options
                    ? q.options.find((o) => o.id === q.correctAnswer)?.label ||
                      ""
                    : q.correctAnswer;

                return (
                  <AccordionItem
                    key={q.id}
                    value={q.id}
                    className="rounded-lg border px-4"
                  >
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        )}
                        <span className="text-sm">
                          <span className="text-muted-foreground mr-1">
                            {qIdx + 1}.
                          </span>
                          {q.text}
                        </span>
                        <Badge
                          variant={isCorrect ? "secondary" : "destructive"}
                          className="ml-auto shrink-0"
                        >
                          {isCorrect ? "Верно" : "Неверно"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Ваш ответ:
                          </p>
                          <p
                            className={
                              isCorrect ? "text-emerald-700" : "text-red-600"
                            }
                          >
                            {userAnswerLabel}
                          </p>
                        </div>
                        {!isCorrect && (
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Правильный ответ:
                            </p>
                            <p className="text-emerald-700">{correctLabel}</p>
                          </div>
                        )}
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="font-medium text-muted-foreground mb-1">
                            Пояснение:
                          </p>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(practiceBackUrl)}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Пройти заново
        </Button>
        {nextSectionIndex !== null && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/module/${id}/practice?s=${nextSectionIndex}`)
            }
            className="gap-2"
          >
            Следующее задание
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={() => router.push(`/module/${id}/test`)}
          className="gap-2"
        >
          Перейти к тесту
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
