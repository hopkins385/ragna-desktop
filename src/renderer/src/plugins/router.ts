import { createRouter, createWebHashHistory } from 'vue-router';

import Chat from '../pages/chat.vue';
import ChatHistory from '../pages/chat-history.vue';
import About from '../pages/about.vue';
import Models from '../pages/models.vue';
import Settings from '../pages/settings.vue';
import Editor from '../pages/editor.vue';
import Files from '../pages/files.vue';

const routes = [
  { path: '/', component: Chat },
  { path: '/chat-history', component: ChatHistory },
  { path: '/about', component: About },
  { path: '/models', component: Models },
  { path: '/settings', component: Settings },
  { path: '/editor', component: Editor },
  { path: '/files', component: Files },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
