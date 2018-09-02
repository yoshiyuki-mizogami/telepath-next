const SNOW_WIDTH = 1.5
const SNOW_HEIGHT = 2
const INITIAL_QUANTITY = 5
const GENERATE_RATE = 0.5
class Snows{
  /**
   * Creates an instance of Snows.
   * @param {HTMLCanvasElement} ctx 
   * @param {number} width 
   * @param {number} height 
   * @memberof Snows
   */
  constructor(ctx, width, height){
    this.continue = true
    this.width = width
    this.height = height
    this.ctx = ctx
    const ary = []
    for(let i = INITIAL_QUANTITY; i ; i--){
      ary[i] = 0
    }
    this.snows = ary.map(()=>{
      return new Snow(ctx, width, height)
    })
    this.startDraw()
  }
  startDraw(){
    this.draw()
  }
  draw(){
    if(!this.continue){
      return
    }
    this.snows.forEach(s=>{
      s.draw()
      if(this.height <= s.y){
        s.revoke()
      }
    })
    this.snows = this.snows.filter(s=>!s.ban)
    setTimeout(()=>{
      this.clear()
      this.draw()
      if(Math.random() < GENERATE_RATE){
        this.snows.push(new Snow(this.ctx, this.width, this.height))
      }
    }, 50)
  }
  clear(){
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  end(){
    this.snows = []
    this.continue = false
  }
}
class Snow{
  /**
   * Creates an instance of Snow.
   * @param {HTMLCanvasElement} ctx 
   * @param {number} height - render area height
   * @param {number} width - render area width
   * @memberof Snow
   */
  constructor(ctx, width, height){
    this.baseSize = Math.random() * 3
    this.ctx = ctx
    this.height = height
    this.x = parseInt( width * Math.random())
    this.y = 0
    this.w = SNOW_WIDTH
  }
  draw(){
    this.y += ((Math.random() < .5) ? 2 : 3) * this.baseSize
    this.x += (Math.random() < .5) ? -1 : 1
    this.w -= 0.1
    if(this.w <= 0){
      this.w =  SNOW_WIDTH
    }
    const w = this.w * this.baseSize
    const h = SNOW_HEIGHT * this.baseSize
    const {ctx} = this
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x - w, this.y + h)
    ctx.lineTo(this.x, this.y + (h * 2))
    ctx.lineTo(this.x + w, this.y + h)
    ctx.fill()
  }
  revoke(){
    this.ban = true
  }
}
const snow = {
  start(cvs){
    const w = cvs.clientWidth
    const h = cvs.clientHeight
    cvs.setAttribute('width', w)
    cvs.setAttribute('height', h)
    /* @type {HTMLCanvasElement} */
    const ctx = cvs.getContext('2d')
    this.snows = new Snows(ctx, w, h)
  },
  stop(){
    if(!this.snows){
      return
    }
    this.snows.end()
  }
}
module.exports = snow