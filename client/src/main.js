import { createApp,h } from 'vue'
import App from './App.vue'
import '@/assets/main.css';

const app = createApp({
    render: ()=>h(App)
});

app.mount('#app')
