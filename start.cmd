start http://127.0.0.1:8124

set	CYGWIN=nodosfilewarning
path %CD%\redist\node;%CD%\redist\sqlite;%CD%\redist\libextractor;%PROGRAMFILES%\VideoLAN\VLC;
node.exe server/src/server.js

