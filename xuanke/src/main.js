import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router' // 如果使用 Vue Router

const app = createApp(App)
app.use(ElementPlus)
app.use(router) // 如需路由功能
app.mount('#app')
