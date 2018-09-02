let globalEv = null
const smoothStep = function(s, e ,p){
  if(p <= s){return 0}
  if(p >= e){return 1}
  const x = (p - s) / (e - s)
  return x*x*x*(x*(x*6 - 15)+10)
}
const duration = 800
function smScroll(el, parent, offset){
  clearTimeout(globalEv)
  const start = Date.now()
  const end = start + duration
  const rect = el.getBoundingClientRect()
  const startTop = parent.scrollTop
  const distance = rect.top - offset
  const scroll = ()=>{
    const now = Date.now()
    const p = smoothStep(start, end, now)
    parent.scrollTop = Math.round(startTop + (distance * p))
    if(now >= end){
      return
    }
    globalEv = setTimeout(scroll, 0)
  }
  scroll()
}
export default smScroll