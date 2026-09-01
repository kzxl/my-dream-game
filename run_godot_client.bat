@echo off
title MDG Godot Client Launcher
echo ========================================================
echo   MDG: Aethelis - Godot 4 C# Client (Offline First)
echo ========================================================
set DOTNET_ROOT=D:\Tools\dotnet
set PATH=D:\Tools\dotnet;%PATH%

echo Dang khoi dong Game Client...
start "" "D:\Tools\Godot\Godot_v4.3-stable_mono_win64\Godot_v4.3-stable_mono_win64.exe" --path "%~dp0src\Mdg.Client.Godot"
exit
