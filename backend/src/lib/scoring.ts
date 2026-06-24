export type QuestionType = 'single_choice' | 'multiple_response' | 'true_false';

export interface CheckResult {
  correct: boolean;
  correct_keys: string[];
  explanation: string;
}

export interface QuestionOption {
  key: string;
  is_correct: boolean;
}

/**
 * Evaluates a user's answer against the correct options.
 * single_choice: exactly one selected must match the correct key
 * multiple_response: all selected must be correct AND all correct must be selected (all-or-nothing)
 * true_false: same as single_choice but key is 'true' or 'false'
 */
export function checkAnswer(
  type: QuestionType,
  selectedKeys: string[],
  correctOptions: QuestionOption[],
): { correct: boolean; correct_keys: string[] } {
  const correctKeys = correctOptions
    .filter((o) => o.is_correct)
    .map((o) => o.key);

  if (type === 'single_choice' || type === 'true_false') {
    if (selectedKeys.length !== 1) {
      return { correct: false, correct_keys: correctKeys };
    }

    const selected = selectedKeys[0] ?? '';
    const correct = correctKeys.includes(selected);
    return { correct, correct_keys: correctKeys };
  }

  if (type === 'multiple_response') {
    if (new Set(selectedKeys).size !== selectedKeys.length) {
      return { correct: false, correct_keys: correctKeys };
    }

    if (selectedKeys.length !== correctKeys.length) {
      return { correct: false, correct_keys: correctKeys };
    }
    const selectedSet = new Set(selectedKeys);
    const allCorrect = correctKeys.every((k) => selectedSet.has(k));
    return { correct: allCorrect, correct_keys: correctKeys };
  }

  return { correct: false, correct_keys: correctKeys };
}
