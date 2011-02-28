////////////////////////////////////////////////////////////////////////////////
// Yalp Server
////////////////////////////////////////////////////////////////////////////////
var	$http = require('http'),
		$url = require('url'),
		$path = require('path'),
		$fs = require('fs'),
		tag = require('./db/tag').tag,
		library = require('./logic/library').library,
		root = require('./logic/root').root,
		media = require('./logic/media').media,
		envelope = require('./utils/envelope').envelope;

// creating server object
$http.createServer(function (req, res) {
	var	url = $url.parse(req.url, true),
			endpoint = url.pathname,
			filePath,
			query = url.query,
			ok;

  // executing command
	switch (endpoint) {
	case '/get':
		ok = envelope(res, true, function () {
			library.getAll(function (data) {
				ok(data);
			});
		});
		break;
		
	case '/add':
		// adding path to root collection or library
		ok = envelope(res, true, function () {
			if (!query.to || !query.path) {
				throw "Missing parameters";
			}
			if (query.to.toLowerCase() === 'roots') {
				// adding root path
				library.addRoot(query.path, function () {
					ok(query);
				});
			} else {
				// adding a media file by path
				throw "Feature unimplemented";
			}
		});
		break;
	
	case '/scan':
		// adding path to root collection or library
		ok = envelope(res, true, function () {
			if (!query.path) {
				throw "Missing parameters";
			}
			// scanning
			root(query.path).scan(function (metadata) {
				ok(metadata);
			});
		});
		break;
	
	case '/play':
		// playing back media file
		envelope(res, false, function () {
			if (!query.path) {
				throw "Missing path parameter";
			}
			media(query.path).play();
		});
		break;
		
	case '/rate':
		// rating a media file
		ok = envelope(res, true, function () {
			if (!query.mediaid || !query.at) {
				throw "Missing parameters";
			}
			media(query.mediaid).rate(query.at, function () {
				ok(query);
			});
		});
		break;
	
	case '/addtag':
		// deleting tag
		ok = envelope(res, true, function () {
			if (!query.mediaid || !query.tag) {
				throw "Missing parameters";
			}
			tag.add(query, function () {
				ok(query);
			});
		});
		break;

	case '/changetag':
		// updating tag
		ok = envelope(res, true, function () {
			if (!query.mediaid || !query.before || !query.after) {
				throw "Missing parameters";
			}
			tag.set({mediaid: query.mediaid, tag: query.before}, {tag: query.after}, function () {
				ok(query);
			});
		});
		break;		
		
	case '/deltag':
		// deleting tag
		ok = envelope(res, true, function () {
			if (!query.mediaid || !query.tag) {
				throw "Missing parameters";
			}
			tag.remove(query, function () {
				ok(query);
			});
		});
		break;
		
	default:
		// acting as static file server
		filePath = $path.join(process.cwd(), '../../client' + endpoint);
		$path.exists(filePath, function (exists) {
			if (!exists) {
				res.writeHead(404, {"Content-Type": "text/plain"});
				res.end("404 Not Found\n");
				return;
			}

			if ($fs.statSync(filePath).isDirectory()) {
				filePath += '/index.html';
			}

			$fs.readFile(filePath, "binary", function (err, file) {
				if (err) {        
					res.writeHead(400, {"Content-Type": "text/plain"});
					res.end(err + "\n");
					return;
				}
				res.writeHead(200);
				res.end(file, "binary");
			});
		});
	}
}).listen(8124, "127.0.0.1");

console.log("Server running at http://127.0.0.1:8124/");

