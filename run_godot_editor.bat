@echo off
title MDG Godot Editor Launcher
echo ========================================================
echo   MDG: Aethelis - Mo Godot 4 Editor (.NET C#)
echo ========================================================
set DOTNET_ROOT=D:\Tools\dotnet
set PATH=D:\Tools\dotnet;%PATH%

echo Dang mo Godot Editor cho du an MDG...
start "" "D:\Tools\Godot\Godot_v4.3-stable_mono_win64\Godot_v4.3-stable_mono_win64.exe" -e --path "%~dp0src\Mdg.Client.Godot"
exit
