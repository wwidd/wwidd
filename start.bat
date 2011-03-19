@ECHO OFF

start http://127.0.0.1:8124

:Retry
node server/src/server.js
IF ERRORLEVEL <> 0 GOTO Retry

