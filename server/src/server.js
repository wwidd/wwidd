////////////////////////////////////////////////////////////////////////////////
// Wwidd Application Server
////////////////////////////////////////////////////////////////////////////////
/*global require, process, console */
require.paths.unshift('server/src');

var	$http = require('http'),
		$url = require('url'),
		$path = require('path'),
		browser = require('tools/browser').browser,	
		ifconfig = require('tools/ifconfig').ifconfig,		
		file = require('ajax/file'),
		
		// modlules
		library = require('ajax/library'),
		media = require('ajax/media'),
		tag = require('ajax/tag'),
		root = require('ajax/root'),
		system = require('ajax/system'),
		
		// environmental variables
		PORT = 8124,
		DEBUG = false;
		
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
function createServer() {
	return $http.createServer(function (req, res) {
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
					if (files[i].split('/')[0] === 'common') {
						filePath = $path.join(process.cwd(), files[i] + ext);
					} else {
						filePath = $path.join(process.cwd(), 'client/www/' + files[i] + ext);
					}
					file.add(filePath, res);
				}
				res.end();
			}());
			break;
			
		default:
			// acting as static file server
			(function () {
				var	filePath;
					
				switch (endpoint.split('/')[1]) {
				case 'cache':
					filePath = $path.join(process.cwd(), 'server' + endpoint);
					break;
				case 'common':
					filePath = $path.join(process.cwd(), endpoint);
					break;
				default:
					filePath = $path.join(process.cwd(), 'client/www' + endpoint);
					break;
				}
				
				file.fetch(filePath, res, DEBUG);
			}());
		}
	});
}

function startBrowser(url) {
	browser.exec(url, function () {
		console.log("Browser started.");
	});
}

ifconfig.exec(function (ip) {
	var url = 'http://' + ip + ':' + PORT;
	try {
		createServer().listen(PORT, ip, function () {
			console.log("Started server at " + url);
			startBrowser(url);
		});
	} catch (e) {
		if (e.code === 'EADDRINUSE') {
			console.log("Server already running at " + url);
			startBrowser(url);
			process.exit(0);
		} else {
			// unknown error
			process.exit(100);
		}
	}
});

