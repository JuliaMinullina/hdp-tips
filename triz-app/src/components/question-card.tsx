"use client";

import { useMemo } from "react";
import { Question, QuestionOption } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  result?: boolean;
}

export function QuestionCard({
  question,
  index,
  value,
  onChange,
  disabled,
  result,
}: QuestionCardProps) {
  const isReview = result !== undefined;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffledOptions = useMemo<QuestionOption[] | undefined>(
    () => question.options ? shuffleArray(question.options) : undefined,
    [question.id]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium leading-relaxed flex items-start gap-2">
          <span className="mr-0 text-muted-foreground shrink-0">{index}.</span>
          <span className="flex-1">{question.text}</span>
          {isReview &&
            (result ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
            ))}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.type === "mc" && shuffledOptions ? (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            className="flex flex-col gap-3"
          >
            {shuffledOptions.map((opt) => {
              const isSelected = value === opt.id;
              const isCorrectOption =
                isReview && opt.id === question.correctAnswer;
              const isWrongSelection =
                isReview && isSelected && !result;

              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2 -mx-3",
                    isCorrectOption && "bg-emerald-100/60",
                    isWrongSelection && !isCorrectOption && "bg-red-100/60"
                  )}
                >
                  <RadioGroupItem
                    value={opt.id}
                    id={`${question.id}-${opt.id}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`${question.id}-${opt.id}`}
                    className={cn(
                      "text-sm leading-relaxed font-normal",
                      disabled ? "cursor-default" : "cursor-pointer",
                      isCorrectOption && "text-emerald-700 font-medium",
                      isWrongSelection &&
                        !isCorrectOption &&
                        "text-red-600 line-through"
                    )}
                  >
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="Введите ваш ответ..."
              className="min-h-[80px] resize-y"
            />
            {isReview && !result && (
              <p className="text-sm text-emerald-700">
                <span className="font-medium">Правильный ответ:</span>{" "}
                {question.correctAnswer}
              </p>
            )}
          </div>
        )}
        {isReview && question.explanation && (
          <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
            <span className="font-medium text-muted-foreground">Пояснение: </span>
            {question.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
