Yalp
====

Yalp is a **browser-based, offline video tagger**, for organizing, searching, and playing back your existing collection.

Even working with thousands of videos, Yalp is designed to be responsive and fast to work with. Having frequently used actions such as search and tagging heavily assisted, you can set up a library with meaningful, searchable tags in no time.

Yalp is open, written entirely in JavaScript, and built on top of other open libraries and tools such as Node.js, SQLite, libextractor, ffmpeg, and VLC.

Current version is 0.2.

Features
--------

Importing videos from disk:

- Auto-tagging

Color-coded tag categories:

- Filtering displayed tags by category

Search:

- Searching by multiple tags
- Auto-complete

Batch actions:

- Adding, renaming, and deleting tags
- Scope: entire library, search results, selected or single entries

Installation
------------

### Simple installation on Windows

1. Download and install [VLC](http://www.videolan.org/vlc/).
2. Download the zipped full package `yalp-X.X-win-simple.zip` (Yalp + dependencies).
3. Unzip the package into a folder of your choice. Recommended: `C:\yalp`.

### Normal installation on Windows, Linux, OS X (never tested on Mac)

1. Get the dependencies one by one. Make sure all of them are in the system path after installation. The current version won't warn you about missing dependencies.
2. Download the zipped package `yalp-X.X.zip`.
3. Unzip the package into a folder of your choice.

Dependency list:

- Node.js 0.4.x:
	- You might want to build it yourself: [source](http://nodejs.org/#download)
	- [Debian package](http://packages.debian.org/search?keywords=nodejs)
	- [Windows](http://node-js.prcn.co.cc/)
	- [OS X](https://sites.google.com/site/nodejsmacosx/)
- [SQLite](http://www.sqlite.org/download.html)
- [Libextractor](http://www.gnu.org/software/libextractor/download.html)
- ffmpeg:
	- [Windows](http://ffmpeg.zeranoe.com/builds/)
	- [OS X](http://ffmpegx.com/download.html)
- [VLC](http://www.videolan.org/vlc/)

### Starting Yalp

1. Start `start.sh` on Linux and Mac, `start.cmd` on Windows.
2. A terminal window will pop up, ignore it (or minimize, but don't close it!)
3. Yalp will be opened in a new window or tab in the default browser.

Using Yalp
----------

Check the Wiki.

Stopping Yalp
-------------

1. Close the browser window / tab.
2. Close the terminal window.

