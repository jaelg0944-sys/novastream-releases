@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "SDK_ROOT=C:\Users\Geo\AppData\Local\Android\Sdk"
set "SDKMANAGER=%SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat"

echo === ACEPTANDO LICENCIAS ===
echo y | "%SDKMANAGER%" --sdk_root="%SDK_ROOT%" --licenses

echo === INSTALANDO PLATFORMS Y BUILD-TOOLS ===
echo y | "%SDKMANAGER%" --sdk_root="%SDK_ROOT%" "platforms;android-34" "platforms;android-35" "platforms;android-36" "build-tools;34.0.0" "build-tools;35.0.0"
