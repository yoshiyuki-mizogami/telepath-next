const htmlTypeReg = /^(https?:\/\/.+|\\\\.+)$/mg
const codeReg = /^```(.+)\n([\s\S]+?(?:```\n?)|[\s\S]+)/mg
const chopReg = /```\n*$/
function httpReplace(txt){
  return `<a href="#">${txt}</a>`
}
const langs = {
  js:'javascript',
  javascript:'javascript',
  vb:'vbscript',
  vba:'vbscript',
  css:'css',
  html:'html'
}
function codeReplace(txt, _lang){
  const lang = langs[_lang]
  if(!lang){
    return txt
  }
  const span = document.createElement('span')
  span.innerText = txt.replace(chopReg,'')

  return `<pre class="code"><code class="${lang}">${span.innerHTML}</code></pre>`
}
export default txt=>{
  let chit = false, hhit = false
  let content = txt.replace(codeReg, (_, lang, code)=>{
    chit = true
    return codeReplace(code, lang)
  })
  content = content.replace(htmlTypeReg, (_, http)=>{
    hhit = true
    return httpReplace(http)
  })
  return {
    type:chit || hhit ? 'html' : 'text',
    content
  }
}