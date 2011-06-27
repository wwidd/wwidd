////////////////////////////////////////////////////////////////////////////////
// VLC Video Playback Tool
////////////////////////////////////////////////////////////////////////////////
/*global require, exports */
var	tool = require('../tools/tool').tool,

vlc = function () {
	// inheriting from tool
	var self = Object.create(tool, {executable: {value: 'vlc'}});
			
	self.exec = function (path, args, handler) {
		tool.exec.call(self, args.concat([path]), handler);
		return self;
	};
	
	return self;
}();

exports.vlc = vlc;

