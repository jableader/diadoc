import { createApp,h } from 'vue'
import App from './App.vue'

import jointJs from '@/plugins/jointjsimport';

const app = createApp({
    render: ()=>h(App)
});

app.use(jointJs);
app.mount('#app')
