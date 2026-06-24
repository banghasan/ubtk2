import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import AuthView from './views/AuthView.vue';
import HomeView from './views/HomeView.vue';
import TopicView from './views/TopicView.vue';
import QuizView from './views/QuizView.vue';

const routes = [
  { path: '/auth', name: 'auth', component: AuthView },
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/topics/:id', name: 'topics', component: TopicView, meta: { requiresAuth: true } },
  { path: '/quiz/:id', name: 'quiz', component: QuizView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

async function getAuthEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth');
    if (!res.ok) return true;
    const data = await res.json() as { auth_enabled?: boolean };
    return Boolean(data.auth_enabled);
  } catch {
    return true;
  }
}

const authEnabled = await getAuthEnabled();

router.beforeEach((to, _from, next) => {
  const token = sessionStorage.getItem('auth_token');
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth);

  if (to.path === '/auth' && !authEnabled) {
    next('/');
  } else if (needsAuth && authEnabled && !token) {
    next('/auth');
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount('#app');
