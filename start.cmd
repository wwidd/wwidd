set	CYGWIN=nodosfilewarning
path %PATH%;%CD%\redist\ffmpeg;%CD%\redist\node;%CD%\redist\sqlite;%PROGRAMFILES%\VideoLAN\VLC;
node.exe server/src/server.js %* > error.txt

