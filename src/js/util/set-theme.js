import path from 'path'
const themes = '../css/themes'
export default theme=>{
  const targetTheme = path.join(themes, theme + '.css')
  const themeHolder = document.getElementById('themeHolder')
  themeHolder.setAttribute('href', targetTheme)
}