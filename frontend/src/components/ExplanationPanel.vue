<template>
  <div class="explanation-panel" :class="{ correct: isCorrect, incorrect: !isCorrect }">
    <div class="explanation-header">
      <span v-if="isCorrect" class="explanation-status correct-status">&#10003; Benar</span>
      <span v-else class="explanation-status incorrect-status">&#10007; Salah</span>
      <span class="explanation-time">{{ formattedTime }}</span>
    </div>

    <div class="explanation-answer">
      <strong>Jawaban benar:</strong>
      <span class="correct-keys">{{ correctKeysDisplay }}</span>
    </div>

    <div class="explanation-body">
      <strong>Pembahasan:</strong>
      <p>{{ explanation }}</p>
    </div>

    <button class="explanation-next" @click="$emit('next')">
      Soal Berikutnya
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  correct: boolean;
  correct_keys: string[];
  explanation: string;
  elapsed_seconds: number;
  show_next?: boolean;
}>();

defineEmits<{
  (e: 'next'): void;
}>();

const isCorrect = computed(() => props.correct);

const formattedTime = computed(() => {
  const m = Math.floor(props.elapsed_seconds / 60);
  const s = props.elapsed_seconds % 60;
  return `Waktu: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const correctKeysDisplay = computed(() => props.correct_keys.join(', '));
</script>

<style scoped>
.explanation-panel {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #aab4c0;
}

.explanation-panel.correct {
  border-left-color: #2f855a;
}

.explanation-panel.incorrect {
  border-left-color: #c53030;
}

.explanation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.explanation-status {
  font-size: 1.2rem;
  font-weight: 700;
}

.correct-status {
  color: #2f855a;
}

.incorrect-status {
  color: #c53030;
}

.explanation-time {
  color: #556677;
  font-weight: 600;
}

.explanation-answer {
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.correct-keys {
  font-weight: 700;
  color: #2f855a;
  margin-left: 6px;
}

.explanation-body {
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.7;
}

.explanation-body p {
  margin-top: 6px;
  color: #445566;
}

.explanation-next {
  display: inline-block;
  padding: 12px 28px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.explanation-next:hover {
  background: #1c3a9c;
}
</style>
