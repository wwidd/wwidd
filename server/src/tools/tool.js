////////////////////////////////////////////////////////////////////////////////
// Command Line Tool
//
// Base class for command line execution
////////////////////////////////////////////////////////////////////////////////
var $child_process = require('child_process'),

tool = {
	// name of executable file
	executable: null,
	
	// parser interpreting the tool's output
	parser: null,
	
	// child process
	child: null,
	
	// pipes data to the child process' input
	pipe: function (data, self) {
		self = self || this;
		if (self.child) {
			self.child.stdin.end(data);
		}
		return self;
	},
	
	// executes tool in specified mode
	exec: function (args, handler, self) {
		var stdout = [];
		
		self = self || this;		

		if (!self.executable) {
			throw "No executable defined for tool.";
		}

		// starting tool
		self.child = $child_process.spawn(self.executable, args);

		// data buffering
		self.child.stdout.on('data', function (data) {
			stdout.push(Buffer.isBuffer(data) ? data.toString('binary') : data);
		});

		// handling tool exit
		self.child.on('exit', function (code) {
			if (code !== 0) {
				throw ["Tool", "'" + self.executable + "'", "exited with code:", code].join(" ") + ".";
			}
			if (!handler) {
				return;
			}
			if (!self.parser) {
				handler(stdout.join(''));
				return;
			}
			self.child = null;
			
			handler(self.parser.parse(stdout.join('')));
		});
		
		return self;
	}
};

// exports
exports.tool = tool;

