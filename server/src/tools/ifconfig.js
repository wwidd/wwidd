////////////////////////////////////////////////////////////////////////////////
// IP Config
////////////////////////////////////////////////////////////////////////////////
/*global require, exports, console */
var	system = require('../utils/system').system,
		parser = require('../utils/parser').parser,
		tool = require('../tools/tool').tool,

ifconfig = function () {
	var LOOPBACK = '127.0.0.1',
			IP4 = /\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3}/,
	
	executable = {'cygwin': 'ipconfig', 'windows': 'ipconfig'}[system.os] || 'ifconfig',
	
	self = Object.create(tool, {
		executable: {value: executable},
		binary: {value: true}
	});

	self.exec = function (handler) {
		tool.exec.call(self, null, function (code, stdout) {
			var result = LOOPBACK,
					i, ip;

			// acquiring IP address
			if (code === 0) {
				ip = IP4.exec(stdout);
				if (result) {
					result = ip;
					console.log("IFCONFIG - detected IP: " + result);
				} else {
					console.log("IFCONFIG - no IP detected, using loopback IP");					
				}
			} else {
				console.log("IFCONFIG - ifconfig failed, using loopback IP");
			}
			
			if (handler) {
				handler(result);
			}
		}, true);

		return self;
	};
	
	return self;
}();

exports.ifconfig = ifconfig;

