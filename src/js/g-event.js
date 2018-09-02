import Vue from 'vue'
export default new Vue({
  data:{
    layers:[]
  },
  created(){
    document.documentElement.addEventListener('keydown', ev=>this.onEvent('keydown', ev))
    this.$on('event', this.onEvent)
  },
  methods:{
    addLayer(vm){
      this.layers.push(vm)
    },
    removeLayer(){
      if(this.layers.length <= 1){
        return
      }
      this.layers.pop()
    },
    onEvent(evName, ev){
      const topLayer = this.layers[this.layers.length - 1]
      topLayer.$emit(evName, ev)
    }
  }
})