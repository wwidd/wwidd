////////////////////////////////////////////////////////////////////////////////
// Command Line Tool
//
// Base class for command line execution
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, Buffer, console */
var $os = require('os'),
		$child_process = require('child_process'),

tool = {
	// os type
	os: $os.type().split(/[^A-Za-z0-9]+/)[0].toLowerCase(),
	
	// name of executable file
	executable: null,
	
	// whether the tool's output is binary
	binary: null,
	
	// parser interpreting the tool's output
	parser: null,
	
	// child process
	child: null,
	
	// pipes data to the child process' input
	pipe: function (data) {
		if (this.child) {
			this.child.stdin.end(data);
		}
		return this;
	},
	
	// executes tool in specified mode
	exec: function (args, handler) {
		var stdout = [],
				that = this;		// because of nested functions

		if (!that.executable) {
			throw "No executable defined for tool.";
		}

		// starting tool
		that.child = $child_process.spawn(that.executable, args);

		// data buffering
		that.child.stdout.on('data', function (data) {
			stdout.push(Buffer.isBuffer(data) ? data.toString(that.binary ? 'binary' : 'utf8') : data);
		});

		// handling tool exit
		that.child.on('exit', function (code) {
			if (code !== 0) {
				throw ["Tool", "'" + that.executable + "'", "exited with code:", code].join(" ") + ".";
			}
			if (!handler) {
				return;
			} else if (!that.parser) {
				handler(stdout.join(''));
			} else {
				that.child = null;
				handler(that.parser.parse(stdout.join('')));
			}
		});
		
		return that;
	}
};

console.log("OS type: " + tool.os);

// exports
exports.tool = tool;

