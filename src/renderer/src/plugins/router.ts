import { createRouter, createWebHashHistory } from 'vue-router';

import Chat from '@renderer/pages/chat.vue';
import ChatHistory from '@renderer/pages/chat-history.vue';
import About from '@renderer/pages/about.vue';
import Models from '@renderer/pages/models.vue';
import Settings from '@renderer/pages/settings.vue';
import Editor from '@renderer/pages/editor.vue';
import ChatPdf from '@renderer/pages/chat-pdf.vue';

const routes = [
  { path: '/', component: Chat },
  { path: '/chat-history', component: ChatHistory },
  { path: '/about', component: About },
  { path: '/models', component: Models },
  { path: '/settings', component: Settings },
  { path: '/editor', component: Editor },
  { path: '/chat-pdf', component: ChatPdf },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
