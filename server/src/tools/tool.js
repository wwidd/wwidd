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
	// - args: command line arguments to be passed to process
	// - handler: handler to run after execution completed
	// - silent: doesn't throw exception on nonzero return value
	exec: function (args, handler, silent) {
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
			if (code !== 0 && silent !== true) {
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

console.log("OS - type: " + tool.os);

// exports
exports.tool = tool;

