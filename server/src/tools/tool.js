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
	
	// executes tool in specified mode
	run: function (mode, args, handler, self) {
		var executable = (self || this).executable,
				parser = (self || this).parser,
				child;
				
		if (!executable) {
			throw "No executable defined for tool.";
		}

		// comprehensive return handler w/ output parsing
		function fullHandler(error, stdout, stderr) {
			if (error !== null) {
				throw ["Tool", "'" + executable + "'", "exited with code:", error].join(" ") + ".";
			}
			if (!handler) {
				return;
			}
			if (!parser) {
				handler(stdout);
				return;
			}
			handler(parser.parse(stdout));
		}
		
		// choosing between exec and spawn
		if (mode === 'exec') {
			$child_process.exec([executable].concat(args).join(' '), {maxBuffer: 1024 * 1024}, fullHandler);
		} else {
			child = $child_process.spawn(executable, args);		
			child.on('exit', fullHandler);				
		}
		
		return self;
	},
	
	// executes tool
	exec: function (args, handler, self) {
		return self.run('exec', args, handler, self);
	},
	
	// spawns a new process for the tool
	spawn: function (args, handler, self) {
		return self.run('spawn', args, handler, self);
	}
};

// exports
exports.tool = tool;

