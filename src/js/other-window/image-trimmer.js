import Vue from 'vue'
import {remote} from 'electron'
import TrimRoot from './image-trimmer.vue'
const thisWindow = remote.getCurrentWindow()

thisWindow.emit('receive-image', (imageUrl)=>{
  new Vue({
    el:'#app',
    data:{
      imageUrl:imageUrl
    },
    render(createElement){
      return createElement(TrimRoot)
    }
  })
})
