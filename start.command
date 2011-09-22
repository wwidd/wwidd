DIR="$( cd "$( dirname "$0" )" && pwd )"
PATH="$DIR/redist/sqlite/":"$DIR/redist/node/":"$DIR/redist/ffmpeg/":/Applications/VLC.app/Contents/MacOS:$PATH
cd "$DIR"
node "$DIR/server/src/server.js" $* > error.txt
