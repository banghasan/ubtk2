<template>
  <div class="auth-view">
    <div class="auth-box">
      <h1 class="auth-title">UTBK Belajar</h1>
      <p class="auth-subtitle">Masukkan password untuk melanjutkan.</p>

      <form class="auth-form" @submit.prevent="login">
        <input
          v-model="password"
          type="password"
          class="auth-input"
          placeholder="Password"
          autofocus
          :disabled="loading"
        />
        <p v-if="error" class="auth-error">{{ error }}</p>
        <button type="submit" class="auth-btn" :disabled="loading || !password">
          {{ loading ? 'Memverifikasi...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const password = ref('');
const loading = ref(false);
const error = ref('');

async function login() {
  if (!password.value) return;
  loading.value = true;
  error.value = '';

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      error.value = body.message || 'Gagal login.';
      return;
    }

    const data = await res.json();
    sessionStorage.setItem('auth_token', data.token);
    router.push('/');
  } catch {
    error.value = 'Tidak dapat terhubung ke server.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-box {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: #556677;
  margin-bottom: 28px;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-input {
  padding: 12px 16px;
  border: 2px solid #d4dde6;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}

.auth-input:focus {
  border-color: #1e40af;
}

.auth-error {
  color: #c53030;
  font-size: 0.9rem;
}

.auth-btn {
  padding: 12px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.auth-btn:hover:not(:disabled) {
  background: #1c3a9c;
}

.auth-btn:disabled {
  background: #aab4c0;
  cursor: default;
}
</style>
