import {createApp} from 'vue';
import {createRouter,createWebHashHistory} from 'vue-router';
import App from './App.vue';
(window as any).vueInvocations=0;(window as any).vueAlternativeInvocations=0;(window as any).vueGetterReads=0;(window as any).vueError={synthetic:true};(window as any).vueSchedule=['sync'];
Promise.resolve().then(()=>(window as any).vueSchedule.push('microtask'));
const Empty={template:'<span/>'};
const router=createRouter({history:createWebHashHistory(),routes:[{path:'/',name:'all',component:Empty},{path:'/active',name:'active',component:Empty},{path:'/completed',name:'completed',component:Empty}]});
const app=createApp(App);app.use(router);router.isReady().then(()=>app.mount('#app'));
