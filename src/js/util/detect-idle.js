const {spawn} = require('child_process')
const {EventEmitter} = require('events')
const sourceCode = `
Add-Type
 "
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
namespace MYI {
public static class UserInput {
	[DllImport(\`"user32.dll\`",SetLastError=false)]
	private static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
	[StructLayout(LayoutKind.Sequential)]private struct LASTINPUTINFO {
		public uint cbSize;
		public int dwTime;
	}
	public static DateTime LastInput {
		get {
			DateTime bootTime = DateTime.UtcNow.AddMilliseconds(-Environment.TickCount);
			DateTime lastInput = bootTime.AddMilliseconds(LastInputTicks);
			return lastInput;
		}
	}
	public static TimeSpan Idle {
		get {
			return DateTime.UtcNow.Subtract(LastInput);
		}
	}
	public static int LastInputTicks {
		get {
			LASTINPUTINFO lii = new LASTINPUTINFO();
			lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));
		GetLastInputInfo(ref lii);
		return lii.dwTime;
		}
	}
}}";
$limit = 10000 * %d;
$overState = $FALSE;
while($TRUE){$idleTick = [MYI.UserInput]::Idle.Ticks;
$idleOver = $idleTick -gt $limit;
if( -not $overState ){
	if( $idleOver ){
		Write-Host -NoNewLine 1;
		$overState=$TRUE;
	}
}else{
	if(-not $idleOver){
		Write-Host -NoNewLine 0;
		$overState=$FALSE;
	}
} Start-Sleep -Seconds 2;
}
`
class IdleDetector extends EventEmitter{
  constructor(limitMillisec){
    super()
    this.limit = limitMillisec
    this.start()
  }
  start(){
    const code = sourceCode.replace(/[\r\n]/g,'').replace('%d', this.limit)
    const child = spawn('powershell', ['-Command', code])
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', console.error)
    child.stdout.on('data', o=>{
      if(o === '0'){
        this.emit('active')
      }else if(o === '1'){
        this.emit('idle')
      }
    })
  }
}
module.exports = limit=>{
  return new IdleDetector(limit)
}