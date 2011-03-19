REM @ECHO OFF

set env = %CD%\redist\node\env.exe
%env% PATH=%PATH%;%CD%\redist\node;%CD%\redist\sqlite;%CD%\redist\libextractor;

start http://127.0.0.1:8124

node.exe server/src/server.js

