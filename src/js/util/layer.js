import eventHub from '../g-event'
export default {
  data(){
    return {
      show:false
    }
  },
  watch:{
    show(v){
      if(v){
        eventHub.addLayer(this)
      }else{
        eventHub.removeLayer()
      }
    }
  },
  methods:{
    setShortcut(keyConfig){
      this.$on('keydown', ev=>{
        const {key} = ev
        const func = keyConfig[key]
        if(!func){
          return
        }
        func()
      })
    }
  }
}