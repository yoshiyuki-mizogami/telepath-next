var saveFile = file=>{
  let {name, content} = file
  let url = 'data:application/octet-stream;base64,' + content
  return fetch(url).then(res=>res.blob()).then(blob=>{
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.href = url
    a.download = name
    a.setAttribute('style', 'height:0px;width:0px')
    document.body.appendChild(a)
    a.click()
    setTimeout(()=>{
      document.body.removeChild(a)
    })
  })
}
export default saveFile