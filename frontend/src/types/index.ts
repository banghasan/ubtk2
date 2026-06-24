export interface Subject {
  id: number;
  slug: string;
  label: string;
  display_order: number;
}

export interface Topic {
  id: number;
  subject_id: number;
  slug: string;
  label: string;
  display_order: number;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  type: 'single_choice' | 'multiple_response' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: QuestionOption[];
}

export interface CheckResult {
  correct: boolean;
  correct_keys: string[];
  explanation: string;
}
