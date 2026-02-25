"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ModuleProgress } from "@/data/types";
import { modules } from "@/data/modules";
import { StorageProvider, localStorageProvider } from "./storage";

interface ProgressContextValue {
  progress: ModuleProgress[];
  isModuleCompleted: (moduleId: string) => boolean;
  isModuleAvailable: (moduleId: string) => boolean;
  isPracticeCompleted: (moduleId: string) => boolean;
  getModuleProgress: (moduleId: string) => ModuleProgress | undefined;
  submitPracticeResults: (
    moduleId: string,
    answers: Record<string, string>,
    results: Record<string, boolean>
  ) => void;
  submitResults: (
    moduleId: string,
    score: number,
    totalQuestions: number,
    answers: Record<string, string>,
    results: Record<string, boolean>
  ) => boolean;
  resetModuleProgress: (moduleId: string) => void;
  isLoaded: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  storage = localStorageProvider,
}: {
  children: React.ReactNode;
  storage?: StorageProvider;
}) {
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.loadProgress();
    setProgress(saved);
    setIsLoaded(true);
  }, [storage]);

  const persist = useCallback(
    (newProgress: ModuleProgress[]) => {
      setProgress(newProgress);
      storage.saveProgress(newProgress);
    },
    [storage]
  );

  const getModuleProgress = useCallback(
    (moduleId: string) => progress.find((p) => p.moduleId === moduleId),
    [progress]
  );

  const isModuleCompleted = useCallback(
    (moduleId: string) => {
      const mp = getModuleProgress(moduleId);
      return mp?.completed ?? false;
    },
    [getModuleProgress]
  );

  const isPracticeCompleted = useCallback(
    (moduleId: string) => {
      const mp = getModuleProgress(moduleId);
      return mp?.practiceCompleted ?? false;
    },
    [getModuleProgress]
  );

  const isModuleAvailable = useCallback(
    (moduleId: string) => {
      const idx = modules.findIndex((m) => m.id === moduleId);
      if (idx === 0) return true;
      if (idx === -1) return false;
      for (let i = idx - 1; i >= 0; i--) {
        if (modules[i].comingSoon) continue;
        return isModuleCompleted(modules[i].id);
      }
      return true;
    },
    [isModuleCompleted]
  );

  const submitPracticeResults = useCallback(
    (
      moduleId: string,
      answers: Record<string, string>,
      results: Record<string, boolean>
    ) => {
      const existing = progress.find((p) => p.moduleId === moduleId);
      const updated: ModuleProgress = {
        moduleId,
        completed: existing?.completed ?? false,
        bestScore: existing?.bestScore ?? 0,
        totalQuestions: existing?.totalQuestions ?? 0,
        lastAttemptAnswers: existing?.lastAttemptAnswers ?? {},
        lastAttemptResults: existing?.lastAttemptResults,
        practiceCompleted: true,
        practiceAnswers: { ...(existing?.practiceAnswers ?? {}), ...answers },
        practiceResults: { ...(existing?.practiceResults ?? {}), ...results },
      };
      const newProgress = progress.filter((p) => p.moduleId !== moduleId);
      newProgress.push(updated);
      persist(newProgress);
    },
    [progress, persist]
  );

  const submitResults = useCallback(
    (
      moduleId: string,
      score: number,
      totalQuestions: number,
      answers: Record<string, string>,
      results: Record<string, boolean>
    ): boolean => {
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return false;

      const passed =
        mod.passCriteria.type === "max_score"
          ? score >= mod.passCriteria.threshold
          : score >= mod.passCriteria.threshold;

      const existing = progress.find((p) => p.moduleId === moduleId);
      const bestScore = existing ? Math.max(existing.bestScore, score) : score;
      const completed = existing?.completed || passed;

      const updated: ModuleProgress = {
        moduleId,
        completed,
        bestScore,
        totalQuestions,
        lastAttemptAnswers: answers,
        lastAttemptResults: results,
      };

      const newProgress = progress.filter((p) => p.moduleId !== moduleId);
      newProgress.push(updated);
      persist(newProgress);

      return passed;
    },
    [progress, persist]
  );

  const resetModuleProgress = useCallback(
    (moduleId: string) => {
      const existing = progress.find((p) => p.moduleId === moduleId);
      if (!existing) return;
      const updated: ModuleProgress = {
        ...existing,
        lastAttemptAnswers: {},
        lastAttemptResults: undefined,
      };
      const newProgress = progress.filter((p) => p.moduleId !== moduleId);
      newProgress.push(updated);
      persist(newProgress);
    },
    [progress, persist]
  );

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isModuleCompleted,
        isModuleAvailable,
        isPracticeCompleted,
        getModuleProgress,
        submitPracticeResults,
        submitResults,
        resetModuleProgress,
        isLoaded,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
