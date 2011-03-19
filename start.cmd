REM @ECHO OFF

set env = %CD%\redist\node\bin\env.exe
%env% PATH=%PATH%;%CD%\redist\node\bin;%CD%\redist\sqlite;

start http://127.0.0.1:8124

node.exe server/src/server.js

