import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { bootstrapOccupancy } from './api/local-service'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// 存量任务按计划到达回填占用记录（幂等，重复打开只回填一次）。
bootstrapOccupancy()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
