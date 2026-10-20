@echo off
chcp 65001 > nul
title 呪われたAIチャット

echo 起動しています...
echo.

:: node_modules がなければ npm install を実行
if not exist "node_modules" (
  echo 初回セットアップ中...
  cmd /c "C:\Program Files\nodejs\npm.cmd" install
  echo.
)

:: ブラウザを開いてから開発サーバーを起動
echo ブラウザで http://localhost:5173 が開きます
echo このウィンドウを閉じるとサーバーが停止します
echo.
start "" http://localhost:5173
cmd /c "C:\Program Files\nodejs\npm.cmd" run dev

pause
