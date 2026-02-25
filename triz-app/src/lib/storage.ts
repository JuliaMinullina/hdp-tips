import { ModuleProgress } from "@/data/types";

export interface StorageProvider {
  loadProgress(): ModuleProgress[];
  saveProgress(progress: ModuleProgress[]): void;
  clearProgress(): void;
}

const LOCAL_STORAGE_KEY = "triz-progress";

export const localStorageProvider: StorageProvider = {
  loadProgress() {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveProgress(progress: ModuleProgress[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // silently fail
    }
  },

  clearProgress() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
