////////////////////////////////////////////////////////////////////////////////
// Library Service Endpoints
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var $path = require('path'),
		$fs = require('fs'),

// adds the contents of a file to the response
// sychronously
add = function (filePath, res) {
	if ($fs.existsSync(filePath)) {
		res.write($fs.readFileSync(filePath), "binary");
	}
},

// fetches one file from disk as response
fetch = function (filePath, res, debug) {
	$fs.exists(filePath, function (exists) {
		if (!exists) {
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.end("404 Not Found\n");
			return;
		}

		if ($fs.statSync(filePath).isDirectory()) {
			filePath += debug ? '/debug.html' : '/index.html';
		}

		$fs.readFile(filePath, "binary", function (err, file) {
			if (err) {        
				res.writeHead(400, {"Content-Type": "text/plain"});
				res.end(err + "\n");
				return;
			}
			
			switch ($path.extname(filePath)) {
			case '.html':
				res.writeHead(200, {"Content-Type": "text/html"});
				break;
			case '.js':
				res.writeHead(200, {"Content-Type": "text/javascript"});
				break;
			case '.css':
				res.writeHead(200, {"Content-Type": "text/css"});
				break;
			case '.jpg':
			case '.jpeg':
				res.writeHead(200, {"Content-Type": "image/jpeg"});
				break;
			case '.png':
				res.writeHead(200, {"Content-Type": "image/png"});
				break;
			case '.gif':
				res.writeHead(200, {"Content-Type": "image/gif"});
				break;
			case '.sqlite':
				res.writeHead(200, {
					"Content-Type": "application/x-sqlite",
					"Content-Disposition": "attachment; filename=" + $path.basename(filePath)
				});
				break;
			default:
				res.writeHead(200, {"Content-Type": "text/plain"});
				break;
			}
			
			res.end(file, "binary");
		});
	});
};

exports.add = add;
exports.fetch = fetch;

