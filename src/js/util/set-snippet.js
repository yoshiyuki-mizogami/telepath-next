function setSnippet(input, snippet){
  let snipetNLPos = snippet.indexOf('\n') + 1
  const v = input.value
  const nowPos = input.selectionStart
  let result
  const before = v.substr(0, nowPos)
  const after = v.substr(nowPos)
  if(after){
    snippet += '\n'
  }
  if(nowPos === 0 || v[nowPos-1] === '\n'){
    result = before +  snippet + after
  }else{
    result = before + '\n' + snippet + after
    snipetNLPos += 1
  }
  setTimeout(()=>{
    input.selectionStart = input.selectionEnd = nowPos + snipetNLPos
  },0)
  return result
}
export default setSnippet