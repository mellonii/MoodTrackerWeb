import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { loadTheme } from './theme.js'

// сначала подтягиваем пользовательское оформление, потом монтируем приложение —
// чтобы цвета и фон применились сразу, без мерцания
loadTheme().then(() => createApp(App).mount('#app'))
