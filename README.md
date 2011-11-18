Wwidd
=====

Wwidd is a **browser-based desktop video library and video tagger**, for organizing, searching, and playing your collection.

Wwidd is designed to be responsive and fast to work with, even in the thousand-file range. Having frequent actions such as search and tagging heavily assisted, you can set up a library with meaningful, searchable tags in no time.

Wwidd is open, written entirely in JavaScript, and built on top of other open libraries and tools such as Node.js, SQLite, ffmpeg, and VLC.

Full packages and dependencies are nonger available from here. Check [http://wwidd.com](http://wwidd.com).

Features
--------

Importing videos from disk:

- Auto-tagging
- Thumbnail and metadata extraction

Color-coded tag categories:

- Filtering displayed tags by category

Search:

- Searching by multiple tags
- Auto-complete
- Live search

Batch actions:

- Adding, renaming, and deleting tags
- Scope: entire library, search results, selected or single entries

Installation
------------

### Simple installation on Windows and OS X (Snow Leopard)

1. Download and install [VLC](http://www.videolan.org/vlc/).
2. Go to [http://wwidd.com](http://wwidd.com) and download the latest full package `Wwidd###OS.zip` (application + dependencies).
3. Unzip the package into a folder of your choice. E.g. `C:\Wwidd`.

### Normal installation on Windows (Cygwin), Linux, and OS X

1. Get the dependencies one by one. Make sure all of them are in the system path after installation. The current version won't warn you about missing dependencies.
2. Download the latest tagged package `X.X.zip` from the Downloads section.
3. Unzip the package into a folder of your choice.

Dependency list:

- JavaScript libs (all bundled in a ZIP file under 'downloads')
	- jQuery 1.7
	- jOrder 1.2
	- QUnit (for unit tests)
- Node.js 0.4.x:
	- You might want to build it yourself: [source](http://nodejs.org/#download)
	- [Debian package](http://packages.debian.org/search?keywords=nodejs)
	- [Windows](http://node-js.prcn.co.cc/)
	- [OS X](https://sites.google.com/site/nodejsmacosx/)
- [SQLite](http://www.sqlite.org/download.html)
- ffmpeg:
	- [Windows](http://ffmpeg.zeranoe.com/builds/)
	- [OS X](http://ffmpegx.com/download.html)
- [VLC](http://www.videolan.org/vlc/)

### Starting Wwidd

1. Start
	- `start.sh` on Linux
	- `start.command` on OS X (in Finder: right click + open with Terminal)
	- `start.cmd` on Windows
2. A terminal window will pop up, ignore it (or minimize, but don't close it).
3. The application will open a new window or tab in the default browser.

Using Wwidd
-----------

Check the Wiki.

Stopping Wwidd
--------------

1. Close the browser window / tab.
2. Close the terminal window.

