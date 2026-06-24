<template>
  <div class="timer-bar">
    <span class="timer-icon">&#9202;</span>
    <span class="timer-value">{{ formatted }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';

const props = defineProps<{
  running: boolean;
}>();

const emit = defineEmits<{
  (e: 'time', value: number): void;
}>();

const elapsed = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const formatted = computed(() => {
  const m = Math.floor(elapsed.value / 60);
  const s = elapsed.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

watch(
  () => props.running,
  (val) => {
    if (val) {
      elapsed.value = 0;
      intervalId = setInterval(() => {
        elapsed.value++;
        emit('time', elapsed.value);
      }, 1000);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      emit('time', elapsed.value);
    }
  },
);

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.timer-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #1e40af;
  color: #fff;
  border-radius: 10px;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.timer-icon {
  font-size: 1.2rem;
}
</style>
