import Vue from 'vue'
import TlApp from '../vue/app-store/tl-app.vue'
import m from 'moment'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
Vue.filter('formatDateTime', d=>{
  if(!d){
    return ''
  }
  return m(d).format(DATETIME_FORMAT)
})
Vue.component('tl-app', TlApp)