export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: "mc" | "free-form";
  text: string;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

export interface TestSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface ExerciseHint {
  title: string;
  content: string;
}

export interface ExerciseTable {
  headers: string[];
  rows: string[][];
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  table?: ExerciseTable;
  hints: ExerciseHint[];
}

export interface PassCriteria {
  type: "min_score" | "max_score";
  threshold: number;
  totalQuestions: number;
}

export interface Module {
  id: string;
  title: string;
  theory: string;
  practiceExercises?: PracticeExercise[];
  practiceSections: TestSection[];
  testSections: TestSection[];
  passCriteria: PassCriteria;
  comingSoon?: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  bestScore: number;
  totalQuestions: number;
  lastAttemptAnswers: Record<string, string>;
  lastAttemptResults?: Record<string, boolean>;
  practiceCompleted?: boolean;
  practiceAnswers?: Record<string, string>;
  practiceResults?: Record<string, boolean>;
}
