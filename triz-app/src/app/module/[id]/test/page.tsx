"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getModuleById } from "@/data/modules";
import { useProgress } from "@/lib/progress";
import { Question } from "@/data/types";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Lock,
  Send,
  Construction,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    isModuleAvailable,
    submitResults,
    resetModuleProgress,
    getModuleProgress,
    isLoaded,
  } = useProgress();

  const mod = getModuleById(id);
  const mp = isLoaded ? getModuleProgress(id) : undefined;

  const allQuestions = useMemo(() => {
    if (!mod) return [];
    return mod.testSections.flatMap((s) => s.questions);
  }, [mod]);

  const hasResults = !!(mp?.lastAttemptResults && Object.keys(mp.lastAttemptResults).length > 0);

  const [reviewMode, setReviewMode] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoaded && !hasResults) {
      setReviewMode(false);
    }
  }, [isLoaded, hasResults]);

  const isReviewing = hasResults && reviewMode;

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
          {mod.title} — Тест
        </h1>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/30 px-8 py-16 text-center">
          <Construction className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Тест появится позже
          </p>
          <p className="text-sm text-muted-foreground/60">
            Тестовые вопросы для этого модуля ещё в разработке.
          </p>
        </div>
      </div>
    );
  }

  const setAnswer = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const activeAnswers = isReviewing ? (mp?.lastAttemptAnswers ?? {}) : answers;

  const answeredCount = Object.keys(activeAnswers).filter(
    (k) => activeAnswers[k]?.trim() !== ""
  ).length;

  const handleSubmit = () => {
    const results: Record<string, boolean> = {};
    let score = 0;

    allQuestions.forEach((q: Question) => {
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      if (q.type === "mc") {
        const correct = userAnswer === q.correctAnswer.toLowerCase();
        results[q.id] = correct;
        if (correct) score++;
      } else {
        const reference = q.correctAnswer.toLowerCase();
        const correct = userAnswer.includes(reference) || reference.includes(userAnswer);
        results[q.id] = correct && userAnswer.length > 0;
        if (results[q.id]) score++;
      }
    });

    submitResults(id, score, allQuestions.length, answers, results);
    router.push(`/module/${id}/results`);
  };

  const handleRetake = () => {
    resetModuleProgress(id);
    setAnswers({});
    setReviewMode(false);
  };

  const reviewScore = isReviewing
    ? Object.values(mp!.lastAttemptResults!).filter(Boolean).length
    : 0;
  const reviewTotal = allQuestions.length;
  const reviewPercent =
    isReviewing && reviewTotal > 0
      ? Math.round((reviewScore / reviewTotal) * 100)
      : 0;

  let questionCounter = 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
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
        {mod.title} — Тест
      </h1>

      {isReviewing ? (
        <div className="mt-4 space-y-4">
          <Alert
            className={
              mp!.completed
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-amber-200 bg-amber-50/50"
            }
          >
            {mp!.completed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription className="flex flex-col gap-2">
              <span>
                {mp!.completed
                  ? `Тест пройден — ${reviewScore} из ${reviewTotal} (${reviewPercent}%)`
                  : `Тест не пройден — ${reviewScore} из ${reviewTotal} (${reviewPercent}%). Необходимо: ${mod.passCriteria.threshold} из ${mod.passCriteria.totalQuestions}`}
              </span>
              <Progress value={reviewPercent} className="h-2" />
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRetake}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Пройти заново
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Ответьте на все вопросы и нажмите «Отправить». Для прохождения модуля
          необходимо набрать{" "}
          <strong>
            {mod.passCriteria.threshold} из {mod.passCriteria.totalQuestions}
          </strong>{" "}
          баллов.
        </p>
      )}

      {mod.testSections.map((section) => (
        <div key={section.id} className="mt-8">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          {section.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
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
                  value={activeAnswers[q.id] || ""}
                  onChange={(val) => setAnswer(q.id, val)}
                  disabled={isReviewing}
                  result={
                    isReviewing
                      ? mp!.lastAttemptResults![q.id]
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      ))}

      {!isReviewing && (
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
      )}
    </div>
  );
}
