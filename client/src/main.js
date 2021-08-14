import { createApp } from 'vue'
import App from './App.vue'

import jointJs from '@/plugins/jointjsimport';
import VueSuggestion from 'vue-suggestion'

const app = createApp(App);

app.use(jointJs);
app.use(VueSuggestion);

app.mount('#app')
