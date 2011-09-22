////////////////////////////////////////////////////////////////////////////////
// Yalp Server
////////////////////////////////////////////////////////////////////////////////
/*global require, process, console */
require.paths.unshift('server/src');

var	$http = require('http'),
		$url = require('url'),
		$path = require('path'),
		$fs = require('fs'),
		tag = require('db/tag').tag,
		library = require('logic/library').library,
		processes = require('logic/processes').processes,
		root = require('logic/root').root,
		media = require('logic/media').media,
		thumbs = require('logic/thumbs').thumbs,
		envelope = require('utils/envelope').envelope,
		browser = require('tools/browser').browser,	
		ifconfig = require('tools/ifconfig').ifconfig,
		system = require('utils/system').system,
		
		// environmental variables
		PORT = 8124,
		DEBUG = false,
		
		// server object
		server;
		
// processing command line arguments
(function () {
	var argv = process.argv,
			i;
	for (i = 0; i < argv.length; i++) {
		switch (argv[i]) {
		case 'debug':
			DEBUG = true;
			console.log("'DEBUG' set to " + DEBUG);
			break;
		case 'port':
			PORT = parseInt(argv[i + 1], 10) || 8124;
			console.log("'PORT' set to " + PORT);
			break;
		}
	}
}());

// creating server object
server = $http.createServer(function (req, res) {
	var	url = $url.parse(req.url, true),
			endpoint = url.pathname,
			query = url.query,
			ok;

  // executing command
	switch (endpoint) {
	case '/lib/getall':
		// retrieves library list and information on selected library
		envelope(res, true, function (ok) {
			library.list(function (data) {
				ok(data);
			});
		});
		break;
		
	case '/lib/select':
		// sets the selected library
		envelope(res, true, function (ok) {
			if (!query.name) {
				throw "Missing parameters";
			}
			library.set(query.name, function (data) {
				console.log("library changed");
				ok(data);
			});
		});
		break;
		
	case '/media/get':
		envelope(res, true, function (ok) {
			library.getMedia(query.filter, function (data) {
				ok(data);
			});
		});
		break;
		
	case '/tag/getall':
		envelope(res, true, function (ok) {
			library.getTags(function (data) {
				ok(data);
			});
		});
		break;
		
	case '/root/add':
		// adding path to root collection or library
		envelope(res, true, function (ok) {
			if (!query.path) {
				throw "Missing parameters";
			}
			// adding root path
			library.addRoot(query.path, function () {
				ok(query);
			});
		});
		break;
	
	case '/media/play':
		// playing back media file
		envelope(res, false, function () {
			if (!query.mediaid) {
				throw "Missing path parameter";
			}
			media(query.mediaid).play();
		});
		break;
		
	case '/media/rate':
		// rating a media file
		envelope(res, true, function (ok) {
			if (!query.mediaid || !query.at) {
				throw "Missing parameters";
			}
			media(query.mediaid).rate(query.at, function () {
				ok(query);
			});
		});
		break;
	
	case '/tag/add':
		// deleting tag
		envelope(res, true, function (ok) {
			if (!(query.mediaid || query.filter || query.mediaids) || !query.tag) {
				throw "Missing parameters";
			}
			tag.add(query, query.filter, query.mediaids, null, function () {
				ok(query);
			});
		});
		break;

	case '/tag/set':
		// updating tag
		envelope(res, true, function (ok) {
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
		
	case '/tag/explode':
		// exploding tag
		envelope(res, true, function (ok) {
			if (!query.tag) {
				throw "Missing parameters";
			}
			tag.explode(query, query.filter, query.mediaids, function () {
				ok(query);
			});
		});
		break;

	case '/tag/del':
		// deleting tag
		envelope(res, true, function (ok) {
			if (!query.tag) {
				throw "Missing parameters";
			}
			tag.remove(query, query.filter, query.mediaids, null, function () {
				ok(query);
			});
		});
		break;
		
	case '/sys/dirlist':
		// querying directory structure
		envelope(res, false, function () {
			return system.tree(query.root ? query.root.split(',') : null);
		});
		break;
	
	case '/sys/poll':
		// polling processes
		envelope(res, true, function (ok) {
			if (!query.process) {
				throw "Missing parameters";
			}
			processes.poll(query.process, function (data) {
				ok(data);
			});
		});
		break;
	
	case '/media/extract':
		// generates thumbnails
		envelope(res, true, function (ok) {
			if (!query.mediaids) {
				throw "Missing parameters";
			}
			thumbs.generate(query.mediaids.split(/[^0-9]+/), function (data) {
				ok(data);
			});
		});
		break;
	
	case '/pack':
		// packs css of js files together in one request
		(function () {
			var type = {'css': 'css', 'js': 'js'}[query.type] || 'js',
					ext = '.' + type,
					files = query.files.split(','),
					i, filePath;
			res.writeHead(200, {"Content-Type": "text/" + {'css': 'css', 'js': 'javascript'}[type]});
			for (i = 0; i < files.length; i++) {
				filePath = $path.join(process.cwd(), 'client/www/' + files[i] + ext);
				if ($path.existsSync(filePath)) {
					res.write($fs.readFileSync(filePath), "binary");
				}
			}
			res.end();
		}());
		break;
		
	default:
		// acting as static file server
		(function () {
			var	filePath;
				
			if (endpoint.split('/')[1] === 'cache') {
				filePath = $path.join(process.cwd(), 'server' + endpoint);
			} else {
				filePath = $path.join(process.cwd(), 'client/www' + endpoint);
			}
			
			$path.exists(filePath, function (exists) {
				if (!exists) {
					res.writeHead(404, {"Content-Type": "text/plain"});
					res.end("404 Not Found\n");
					return;
				}
	
				if ($fs.statSync(filePath).isDirectory()) {
					filePath += DEBUG ? '/debug.html' : '/index.html';
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
					case '.png':
						res.writeHead(200, {"Content-Type": "image/png"});
						break;
					default:
						res.writeHead(200, {"Content-Type": "text/plain"});
						break;
					}
					res.end(file, "binary");
				});
			});
		}());
	}
});

ifconfig.exec(function (ip) {
	var url = 'http://' + ip + ':' + PORT;
	server.listen(PORT, ip, function () {
		console.log("Server running at " + url);
		browser.exec(url, function () {
			console.log("Browser started.");
		});
	});
});

