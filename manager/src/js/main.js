import Vue from 'vue'
import Root from '../vue/root.vue'
import TlMessage from '../vue/tl-message.vue'
import './util/set-filters'
const DEBUGSETLIMIT = 5

Vue.component('tl-message', TlMessage)
window.onload = function(){
  setTimeout(()=>{
    window.rootVm = new Vue({
      el:'#app',
      render(createElement){
        return createElement(Root)
      }
    })
    let ESCCount = 0
    document.documentElement.addEventListener('keydown', ev=>{
      const {key} = ev
      if(key === 'Escape'){
        ESCCount++
        if(ESCCount === DEBUGSETLIMIT){
          window.rootVm.$children[0].$store.commit('setDebug')
        }
      }
    })
  }, 1000)

}