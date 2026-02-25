"use client";

import { Question } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuestionCardProps {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  index,
  value,
  onChange,
  disabled,
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium leading-relaxed">
          <span className="mr-2 text-muted-foreground">{index}.</span>
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.type === "mc" && question.options ? (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            className="flex flex-col gap-3"
          >
            {question.options.map((opt) => (
              <div key={opt.id} className="flex items-start gap-3">
                <RadioGroupItem
                  value={opt.id}
                  id={`${question.id}-${opt.id}`}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`${question.id}-${opt.id}`}
                  className="cursor-pointer text-sm leading-relaxed font-normal"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Введите ваш ответ..."
            className="min-h-[80px] resize-y"
          />
        )}
      </CardContent>
    </Card>
  );
}
