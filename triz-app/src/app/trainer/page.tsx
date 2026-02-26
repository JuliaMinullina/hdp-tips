"use client";

import { useState, useMemo, useCallback } from "react";
import { modules } from "@/data/modules";
import { PracticeExercise, TestSection } from "@/data/types";
import { QuestionCard } from "@/components/question-card";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dices,
  Send,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";

type TrainerTask =
  | { type: "exercise"; moduleLabel: string; exercise: PracticeExercise }
  | { type: "quiz"; moduleLabel: string; section: TestSection };

function buildTrainerTasks(): TrainerTask[] {
  const tasks: TrainerTask[] = [];

  const mod1 = modules.find((m) => m.id === "module-1");
  if (mod1?.practiceExercises) {
    for (const ex of mod1.practiceExercises) {
      tasks.push({ type: "exercise", moduleLabel: "Модуль 1", exercise: ex });
    }
  }

  const mod2 = modules.find((m) => m.id === "module-2");
  if (mod2) {
    for (const section of mod2.practiceSections) {
      tasks.push({ type: "quiz", moduleLabel: "Модуль 2", section });
    }
  }

  const mod3 = modules.find((m) => m.id === "module-3");
  if (mod3) {
    for (const section of mod3.practiceSections) {
      tasks.push({ type: "quiz", moduleLabel: "Модуль 3", section });
    }
  }

  const mod4 = modules.find((m) => m.id === "module-4");
  if (mod4) {
    for (const section of mod4.practiceSections) {
      tasks.push({ type: "quiz", moduleLabel: "Модуль 4", section });
    }
  }

  return tasks;
}

const SYSTEM_PROMPT_PREFIX =
  "Ты — преподаватель теории решения изобретательских задач (ТРИЗ). Твоя задача — помочь студенту разобраться в теме. Изучи задание, ответы студента, его вопрос и проконсультируй его по теме. Будь вежлив, обсуждай только ТРИЗ и смежные темы (например, креативность, алгоритмы и т.д.). Но не обсуждай нерелевантные темы. Обращайся к студенту напрямую на «вы» — например, «ваш ответ», «вы правильно заметили», «давайте разберём». Не упоминай студента в третьем лице.";

function buildSystemPrompt(
  task: TrainerTask,
  answers: Record<string, string>
): string {
  let context = "";

  if (task.type === "exercise") {
    context += `\n\n--- Задание ---\n${task.exercise.title}\n${task.exercise.description}`;
    if (task.exercise.hints.length > 0) {
      context += "\n\n--- Ответ и пояснение ---";
      for (const hint of task.exercise.hints) {
        context += `\n${hint.title}: ${hint.content}`;
      }
    }
  } else {
    context += `\n\n--- Задание: ${task.section.title} ---`;
    if (task.section.description) context += `\n${task.section.description}`;

    for (const q of task.section.questions) {
      const userAnswer = answers[q.id] || "Не отвечено";
      const userLabel =
        q.type === "mc" && q.options
          ? q.options.find((o) => o.id === userAnswer)?.label || userAnswer
          : userAnswer;
      const correctLabel =
        q.type === "mc" && q.options
          ? q.options.find((o) => o.id === q.correctAnswer)?.label ||
            q.correctAnswer
          : q.correctAnswer;

      context += `\n\nВопрос: ${q.text}`;
      context += `\nОтвет студента: ${userLabel}`;
      context += `\nПравильный ответ: ${correctLabel}`;
    }
  }

  return SYSTEM_PROMPT_PREFIX + context;
}

type Phase = "idle" | "active" | "checked";

export default function TrainerPage() {
  const allTasks = useMemo(() => buildTrainerTasks(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const [taskIndex, setTaskIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [taskKey, setTaskKey] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const currentTask = taskIndex !== null ? allTasks[taskIndex] : null;

  const pickRandom = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * allTasks.length);
    } while (allTasks.length > 1 && next === taskIndex);

    setTaskIndex(next);
    setAnswers({});
    setResults({});
    setPhase("active");
    setTaskKey((k) => k + 1);
    setChatOpen(false);
  }, [allTasks, taskIndex]);

  const handleCheck = useCallback(() => {
    if (!currentTask) return;

    if (currentTask.type === "exercise") {
      setPhase("checked");
      return;
    }

    const newResults: Record<string, boolean> = {};
    for (const q of currentTask.section.questions) {
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      if (q.type === "mc") {
        newResults[q.id] = userAnswer === q.correctAnswer.toLowerCase();
      } else {
        const reference = q.correctAnswer.toLowerCase();
        newResults[q.id] =
          userAnswer.length > 0 &&
          (userAnswer.includes(reference) || reference.includes(userAnswer));
      }
    }

    setResults(newResults);
    setPhase("checked");
  }, [currentTask, answers]);

  const quizAnsweredCount =
    currentTask?.type === "quiz"
      ? currentTask.section.questions.filter(
          (q) => (answers[q.id] || "").trim() !== ""
        ).length
      : 0;

  const systemPrompt =
    currentTask && phase === "checked"
      ? buildSystemPrompt(currentTask, answers)
      : "";

  if (phase === "idle") {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Dices className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Тренажёр</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Решайте задачи из разных модулей, чтобы закрепить новые знания.
        </p>
        <Button size="lg" className="mt-8 gap-2" onClick={pickRandom}>
          <Dices className="h-4 w-4" />
          Показать задачу
        </Button>
      </div>
    );
  }

  if (!currentTask) return null;

  return (
    <div className={chatOpen && phase === "checked" ? "mr-[400px]" : ""}>
        <div className="mx-auto max-w-3xl px-6 py-10" key={taskKey}>
          <div className="mb-6 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {currentTask.moduleLabel}
            </Badge>
            {phase === "checked" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={pickRandom}
              >
                <Dices className="h-4 w-4" />
                Следующая задача
              </Button>
            )}
          </div>

          {currentTask.type === "exercise" ? (
            <ExerciseView
              exercise={currentTask.exercise}
              checked={phase === "checked"}
            />
          ) : (
            <QuizView
              section={currentTask.section}
              answers={answers}
              results={results}
              checked={phase === "checked"}
              onAnswer={(qid, val) =>
                setAnswers((prev) => ({ ...prev, [qid]: val }))
              }
            />
          )}

          <Separator className="my-8" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {phase === "active" && (
              <>
                <p className="text-sm text-muted-foreground">
                  {currentTask.type === "quiz"
                    ? `Отвечено: ${quizAnsweredCount} / ${currentTask.section.questions.length}`
                    : "Решите задачу и нажмите «Проверить»"}
                </p>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handleCheck}
                  disabled={
                    currentTask.type === "quiz" && quizAnsweredCount === 0
                  }
                >
                  <Send className="h-4 w-4" />
                  Проверить
                </Button>
              </>
            )}

            {phase === "checked" && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setAnswers({});
                      setResults({});
                      setPhase("active");
                      setTaskKey((k) => k + 1);
                      setChatOpen(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Решить заново
                  </Button>
                  {!chatOpen && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Задать вопрос по задаче
                    </Button>
                  )}
                </div>
                <Button size="lg" className="gap-2" onClick={pickRandom}>
                  <Dices className="h-4 w-4" />
                  Следующая задача
                </Button>
              </>
            )}
          </div>
        </div>

      {chatOpen && phase === "checked" && (
        <ChatSidebar
          key={`chat-${taskKey}`}
          systemPrompt={systemPrompt}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}

function ExerciseView({
  exercise,
  checked,
}: {
  exercise: PracticeExercise;
  checked: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold leading-relaxed">
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
                    <th key={i} className="px-4 py-2.5 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exercise.table.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b last:border-b-0">
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

        {checked && exercise.hints.length > 0 && (
          <div className="space-y-3 pt-2">
            <Separator />
            <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Ответ и пояснение
            </p>
            <Accordion
              type="multiple"
              defaultValue={exercise.hints.map((_, i) => `hint-${i}`)}
              className="space-y-2"
            >
              {exercise.hints.map((hint, hIdx) => (
                <AccordionItem
                  key={hIdx}
                  value={`hint-${hIdx}`}
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
          </div>
        )}

        {checked && exercise.hints.length === 0 && (
          <div className="pt-2">
            <Separator />
            <p className="mt-3 text-sm text-muted-foreground">
              Это упражнение на самостоятельный анализ. Сравните свою таблицу с
              примером выше и оцените полноту ответа.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuizView({
  section,
  answers,
  results,
  checked,
  onAnswer,
}: {
  section: TestSection;
  answers: Record<string, string>;
  results: Record<string, boolean>;
  checked: boolean;
  onAnswer: (qid: string, val: string) => void;
}) {
  const score = checked
    ? section.questions.filter((q) => results[q.id]).length
    : 0;
  const total = section.questions.length;

  return (
    <div>
      <h2 className="text-lg font-semibold">{section.title}</h2>
      {section.description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {section.description}
        </p>
      )}

      {checked && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm">
            Результат:{" "}
            <span className="font-semibold">
              {score} из {total}
            </span>{" "}
            правильных ответов
          </p>
        </div>
      )}

      <Separator className="my-4" />

      <div className="flex flex-col gap-4">
        {section.questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx + 1}
            value={answers[q.id] || ""}
            onChange={(val) => onAnswer(q.id, val)}
            disabled={checked}
            result={checked ? results[q.id] : undefined}
          />
        ))}
      </div>
    </div>
  );
}
