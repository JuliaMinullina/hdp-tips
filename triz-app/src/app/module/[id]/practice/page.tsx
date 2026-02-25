"use client";

import { use, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { Question } from "@/data/types";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Lock, Send, Lightbulb, Construction } from "lucide-react";

export default function PracticePageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <PracticePage params={params} />
    </Suspense>
  );
}

function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isModuleAvailable, submitPracticeResults, isLoaded } = useProgress();

  const mod = getModuleById(id);

  const hasExercises =
    mod?.practiceExercises && mod.practiceExercises.length > 0;
  const hasMultipleSections =
    mod?.practiceSections && mod.practiceSections.length > 1;

  const sectionIndex = hasMultipleSections
    ? parseInt(searchParams.get("s") || "0", 10)
    : 0;
  const currentSection =
    hasMultipleSections && mod
      ? mod.practiceSections[sectionIndex] ?? mod.practiceSections[0]
      : null;

  const allQuestions = useMemo(() => {
    if (!mod) return [];
    if (currentSection) return currentSection.questions;
    return mod.practiceSections.flatMap((s) => s.questions);
  }, [mod, currentSection]);

  const [answers, setAnswers] = useState<Record<string, string>>({});

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
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1 text-muted-foreground"
          onClick={() => router.push(`/module/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к модулю
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {mod.title} — Задание
        </h1>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 px-8 py-16 text-center">
          <Construction className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Задания появятся позже
          </p>
          <p className="text-sm text-muted-foreground/60">
            Практические задания для этого модуля ещё в разработке.
          </p>
        </div>
      </div>
    );
  }

  // Exercise-based practice (Module 1)
  if (hasExercises) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1 text-muted-foreground"
          onClick={() => router.push(`/module/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к теории
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">
          {mod.title} — Задание
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Выполните упражнения самостоятельно. Раскройте подсказки, чтобы
          проверить себя.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {mod.practiceExercises!.map((exercise, idx) => (
            <Card key={exercise.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium leading-relaxed">
                  <span className="mr-2 text-muted-foreground">
                    {idx + 1}.
                  </span>
                  {exercise.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {exercise.description}
                </div>

                {exercise.table && (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          {exercise.table.headers.map((h, i) => (
                            <th
                              key={i}
                              className="px-4 py-2.5 text-left font-medium"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="border-b last:border-b-0"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-4 py-2.5 ${cIdx === 0 ? "font-medium" : ""}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {exercise.hints.length > 0 && (
                  <Accordion type="multiple" className="space-y-2">
                    {exercise.hints.map((hint, hIdx) => (
                      <AccordionItem
                        key={hIdx}
                        value={`${exercise.id}-hint-${hIdx}`}
                        className="rounded-lg border px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2 text-sm">
                            <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                            {hint.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="whitespace-pre-line rounded-md bg-muted/50 p-3 text-sm">
                            {hint.content}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-end border-t pt-6">
          <Button
            size="lg"
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

  // Quiz-based practice (Modules 2, 3)
  const sectionsToRender = currentSection
    ? [currentSection]
    : mod.practiceSections;

  const setAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.trim() !== ""
  ).length;

  const handleSubmit = () => {
    const results: Record<string, boolean> = {};

    allQuestions.forEach((q: Question) => {
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      if (q.type === "mc") {
        results[q.id] = userAnswer === q.correctAnswer.toLowerCase();
      } else {
        const reference = q.correctAnswer.toLowerCase();
        const correct =
          userAnswer.includes(reference) || reference.includes(userAnswer);
        results[q.id] = correct && userAnswer.length > 0;
      }
    });

    submitPracticeResults(id, answers, results);

    const resultsUrl = hasMultipleSections
      ? `/module/${id}/practice/results?s=${sectionIndex}`
      : `/module/${id}/practice/results`;
    router.push(resultsUrl);
  };

  let questionCounter = 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 gap-1 text-muted-foreground"
        onClick={() => router.push(`/module/${id}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Вернуться к теории
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">
        {currentSection
          ? `${mod.title} — ${currentSection.title}`
          : `${mod.title} — Задание`}
      </h1>
      {currentSection?.description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {currentSection.description}
        </p>
      )}
      {!currentSection && (
        <p className="mt-1 text-sm text-muted-foreground">
          Выполните практические задания. После отправки вы увидите разбор
          ответов и сможете перейти к тесту.
        </p>
      )}

      {sectionsToRender.map((section) => (
        <div key={section.id} className="mt-8">
          {!currentSection && (
            <>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.description}
                </p>
              )}
            </>
          )}
          <Separator className="my-4" />
          <div className="flex flex-col gap-4">
            {section.questions.map((q) => {
              questionCounter++;
              return (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={questionCounter}
                  value={answers[q.id] || ""}
                  onChange={(val) => setAnswer(q.id, val)}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Отвечено: {answeredCount} / {allQuestions.length}
        </p>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={answeredCount === 0}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Отправить ответы
        </Button>
      </div>
    </div>
  );
}
