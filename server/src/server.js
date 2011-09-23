////////////////////////////////////////////////////////////////////////////////
// Wwidd Application Server
////////////////////////////////////////////////////////////////////////////////
/*global require, process, console */
require.paths.unshift('server/src');

var	$http = require('http'),
		$url = require('url'),
		$path = require('path'),
		$fs = require('fs'),
		browser = require('tools/browser').browser,	
		ifconfig = require('tools/ifconfig').ifconfig,
		
		// modlules
		library = require('ajax/library'),
		media = require('ajax/media'),
		tag = require('ajax/tag'),
		root = require('ajax/root'),
		system = require('ajax/system'),
		
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
	switch (endpoint.split('/')[1]) {
	case 'lib':
		library.run(endpoint, query, res);
		break;
		
	case 'media':
		media.run(endpoint, query, res);
		break;
		
	case 'tag':
		tag.run(endpoint, query, res);
		break;
		
	case 'root':
		root.run(endpoint, query, res);
		break;
		
	case 'sys':
		system.run(endpoint, query, res);
		break;
		
	case 'pack':
		// packs css of js files together in one request
		(function () {
			var type = {'css': 'css', 'js': 'js'}[query.type] || 'js',
					ext = '.' + type,
					files = query.files.split(/\s*,\s*/),
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

