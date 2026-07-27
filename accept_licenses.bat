@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo y | "C:\Users\Geo\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="C:\Users\Geo\AppData\Local\Android\Sdk" "build-tools;35.0.0" "platforms;android-36"
echo y | "C:\Users\Geo\AppData\Local\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root="C:\Users\Geo\AppData\Local\Android\Sdk" --licenses
