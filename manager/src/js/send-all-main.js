import Vue from 'vue'
import Root from '../vue/send-all-root.vue'
import './util/set-filters'
new Vue({
  el:'#app',
  render(createElement){
    return createElement(Root)
  }
})