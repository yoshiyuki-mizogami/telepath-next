export default n=>{
  const fi = document.querySelector('style#fontsize')
  fi.innerText = `:root {
    --global-font-size:${n}px;
    --global-line-height: ${n+4}px;
  }`
}