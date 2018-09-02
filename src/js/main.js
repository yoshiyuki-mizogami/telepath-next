import Vue from 'vue'
import Root from '../vue/root.vue'
import MessageBox from '../vue/m.vue'
import FileAttacher from '../vue/file-attacher.vue'
import './vue-filters'
import store from './store'
import {shell} from 'electron'
Vue.component('file-attacher', FileAttacher)

Vue.component('message-box', MessageBox)
window.rootVm = new Vue({
  el:'#app',
  name:'Super',
  store,
  render(createElement){
    return createElement(Root)
  }
})
function openAnchor(ev){
  if(ev.target.tagName !== 'A'){
    return
  }
  const protocol = ev.target.getAttribute('href')
  /* TODO aggregate this logic */
  if(protocol.startsWith('shallwin') ||
     protocol.startsWith('telepath-ra')){
    return
  }
  ev.preventDefault()
  shell.openExternal(ev.target.innerText)
}
window.document.addEventListener('click', openAnchor)
window.document.addEventListener('auxclick',ev=>{
  ev.preventDefault()
  openAnchor(ev)
} )