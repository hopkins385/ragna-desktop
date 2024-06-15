import './assets/css/main.css';

import { router } from './plugins/router';

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import { createApp } from 'vue';
import App from './App.vue';

import VueDOMPurifyHTML from 'vue-dompurify-html';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(VueDOMPurifyHTML);
app.mount('#app');
