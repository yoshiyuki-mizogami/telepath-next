import Vue from 'vue'
import moment from 'moment'
Vue.filter('toCapitalFirstChar', s=>{
  return s.replace(/^./, c=>c.toUpperCase())
})

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

Vue.filter('formatDateTime', (d)=>{
  if(!d){
    return ''
  }
  return moment(d).format(DATETIME_FORMAT)
})