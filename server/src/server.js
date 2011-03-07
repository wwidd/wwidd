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
	case '/getmedia':
		ok = envelope(res, true, function () {
			library.getMedia(query.filter, function (data) {
				ok(data);
			});
		});
		break;
		
	case '/getkinds':
		ok = envelope(res, true, function () {
			library.getKinds(function (data) {
				ok(data);
			});
		});
		break;
		
	case '/addroot':
		// adding path to root collection or library
		ok = envelope(res, true, function () {
			if (!query.path) {
				throw "Missing parameters";
			}
			// adding root path
			library.addRoot(query.path, function () {
				ok(query);
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
			if (!(query.mediaid || query.filter) || !query.tag) {
				throw "Missing parameters";
			}
			tag.add(query, query.filter, function () {
				ok(query);
			});
		});
		break;

	case '/changetag':
		// updating tag
		ok = envelope(res, true, function () {
			if (!query.before || !query.after) {
				throw "Missing parameters";
			}
			tag.set(
				query.mediaid ?
					{mediaid: query.mediaid, tag: query.before} :
					{tag: query.before},
				{tag: query.after}, function () {
				ok(query);
			});
		});
		break;		
		
	case '/deltag':
		// deleting tag
		ok = envelope(res, true, function () {
			if (!query.tag) {
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
				switch ($path.extname(filePath))
				{
				case '.html':
					res.writeHead(200, {"Content-Type": "text/html"});
					break;
				case '.js':
					res.writeHead(200, {"Content-Type": "text/javascript"});
					break;
				case '.css':
					res.writeHead(200, {"Content-Type": "text/css"});
					break;
				default:
					res.writeHead(200, {"Content-Type": "text/plain"});
					break;
				}
				res.end(file, "binary");
			});
		});
	}
}).listen(8124, "127.0.0.1");

console.log("Server running at http://127.0.0.1:8124/");

