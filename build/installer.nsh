#!macro preInit
#${If} ${FileExists} "H:\*.*"
#  SetRegView 64
# WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "H:\telepath-next"
#  SetRegView 32
#  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "H:\telepath-next"
#${EndIf}
#!macroend
!macro customInit
nsExec::Exec 'taskkill.exe /f /im Telepath*'
!macroend
!macro customInstall
  CreateShortCut "$SMSTARTUP\TelepathNext.lnk" "$INSTDIR\TelepathNext.exe" ""
!macroend
!macro customUnInstall
  Delete "$SMSTARTUP\TelepathNext.lnk"
!macroend