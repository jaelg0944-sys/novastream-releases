@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "c:\Users\Geo\Desktop\TV en Vivo\novastream_tv\android"
call gradlew.bat assembleDebug
if exist "c:\Users\Geo\Desktop\TV en Vivo\novastream_tv\android\app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "c:\Users\Geo\Desktop\TV en Vivo\novastream_tv\android\app\build\outputs\apk\debug\app-debug.apk" "C:\Users\Geo\Desktop\NovaStream_TV.apk"
    echo APK COPIADO EXITOSAMENTE AL ESCRITORIO DE LA PC: C:\Users\Geo\Desktop\NovaStream_TV.apk
)
