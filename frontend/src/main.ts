import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import HomeView from './views/HomeView.vue';
import TopicView from './views/TopicView.vue';
import QuizView from './views/QuizView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/topics/:id', name: 'topics', component: TopicView, props: true },
  { path: '/quiz/:id', name: 'quiz', component: QuizView, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');
