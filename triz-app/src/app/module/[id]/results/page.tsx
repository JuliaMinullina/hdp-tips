"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getModuleById, getNextModuleId } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Trophy,
  AlertTriangle,
} from "lucide-react";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getModuleProgress, resetModuleProgress, isLoaded } = useProgress();

  const mod = getModuleById(id);
  const mp = isLoaded ? getModuleProgress(id) : undefined;
  const nextModuleId = getNextModuleId(id);

  const allQuestions = useMemo(() => {
    if (!mod) return [];
    return mod.testSections.flatMap((s) => s.questions);
  }, [mod]);

  if (!mod) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Модуль не найден</p>
      </div>
    );
  }

  if (!isLoaded || !mp || !mp.lastAttemptResults) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">
          {isLoaded ? "Сначала пройдите тест" : "Загрузка..."}
        </p>
      </div>
    );
  }

  const score = Object.values(mp.lastAttemptResults).filter(Boolean).length;
  const total = allQuestions.length;
  const percent = Math.round((score / total) * 100);
  const passed = mp.completed;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Card className={passed ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            {passed ? (
              <Trophy className="h-8 w-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            )}
            <div>
              <CardTitle className="text-xl">
                {passed ? "Тест пройден!" : "Тест не пройден"}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {mod.title}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold tabular-nums">
              {percent}%
            </div>
            <div className="mb-1 text-sm text-muted-foreground">
              {score} из {total} правильных ответов
            </div>
          </div>
          <Progress value={percent} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Порог прохождения:{" "}
            <strong>
              {mod.passCriteria.threshold} из {mod.passCriteria.totalQuestions}
            </strong>
          </p>
        </CardContent>
      </Card>

      {passed && (
        <Alert className="mt-6 border-emerald-200 bg-emerald-50/50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle>Модуль завершён</AlertTitle>
          <AlertDescription>
            {nextModuleId
              ? "Вы можете перейти к следующей теме или пройти тест заново для улучшения результата."
              : "Поздравляем! Вы прошли все модули курса."}
          </AlertDescription>
        </Alert>
      )}

      {!passed && (
        <Alert className="mt-6 border-amber-200 bg-amber-50/50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Не набран проходной балл</AlertTitle>
          <AlertDescription>
            Просмотрите ошибки ниже и попробуйте пройти тест заново. Количество
            попыток не ограничено.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Разбор ответов</h2>
        <Separator className="my-4" />

        {mod.testSections.map((section) => (
          <div key={section.id} className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {section.title}
            </h3>
            <Accordion type="multiple" className="space-y-2">
              {section.questions.map((q, qIdx) => {
                const isCorrect = mp.lastAttemptResults?.[q.id] ?? false;
                const userAnswer = mp.lastAttemptAnswers[q.id] || "";

                const userAnswerLabel =
                  q.type === "mc" && q.options
                    ? q.options.find((o) => o.id === userAnswer)?.label ||
                      "Не отвечено"
                    : userAnswer || "Не отвечено";

                const correctLabel =
                  q.type === "mc" && q.options
                    ? q.options.find((o) => o.id === q.correctAnswer)?.label || ""
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
          onClick={() => {
            resetModuleProgress(id);
            router.push(`/module/${id}/test`);
          }}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Пройти заново
        </Button>
        {passed && nextModuleId && (
          <Button
            onClick={() => router.push(`/module/${nextModuleId}`)}
            className="gap-2"
          >
            Следующая тема
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {passed && !nextModuleId && (
          <Button onClick={() => router.push("/")} className="gap-2">
            На главную
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
