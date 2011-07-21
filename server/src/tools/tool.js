////////////////////////////////////////////////////////////////////////////////
// Command Line Tool
//
// Base class for command line execution
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, Buffer, console */
var $os = require('os'),
		$child_process = require('child_process'),

os = $os.type().split(/[^A-Za-z0-9]+/)[0].toLowerCase(),
		
tool = {
	// os type
	os: os,
	
	// line break string depending on OS
	// to be used in RegExp objects only!
	lineBreak: os in {'windows': 'windows', 'cygwin': 'cygwin'} ? '\\r\\n' : '\\n',
	
	// name of executable file
	executable: null,
	
	// whether the tool's output is binary
	binary: null,
	
	// whether to collect data from stderr as well
	stderr: false,

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
		//console.log(["TOOL - executing:", that.executable, args ? args.join(" ") : ""].join(" "));
		that.child = $child_process.spawn(that.executable, args);

		// callback
		function onData(data) {
			stdout.push(Buffer.isBuffer(data) ? data.toString(that.binary ? 'binary' : 'utf8') : data);
		} 
		
		// data buffering
		that.child.stdout.on('data', onData);
		if (that.stderr) {
			that.child.stderr.on('data', onData);
		}
		
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

console.log("OS - type: " + os);

// exports
exports.tool = tool;

