import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { ensureOccupancy } from './data/occupancy'
import './styles/global.css'

// 启动前先把存量航班任务按计划到达回填成占用记录，并把占用回写到停机位。
ensureOccupancy()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
