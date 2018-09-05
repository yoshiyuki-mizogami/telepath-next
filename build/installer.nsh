#!macro preInit
#${If} ${FileExists} "H:\*.*"
#  SetRegView 64
# WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "H:\telepath-next-cloud"
#  SetRegView 32
#  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "H:\telepath-next-cloud"
#${EndIf}
#!macroend
!macro customInit
nsExec::Exec 'taskkill.exe /f /im TelepathCloud*'
!macroend
!macro customInstall
  CreateShortCut "$SMSTARTUP\TelepathNextCloud.lnk" "$INSTDIR\TelepathNextCloud.exe" ""
!macroend
!macro customUnInstall
  Delete "$SMSTARTUP\TelepathNextCloud.lnk"
!macroend