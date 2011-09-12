////////////////////////////////////////////////////////////////////////////////
// Parser
//
// Parses the output of command line tools into a machine readable
// format.
////////////////////////////////////////////////////////////////////////////////
/*global exports */
var 

parser = {
	rowSeparator: null,			// separates rows - if null, parsed text is one row
	fieldSeparator: '',			// separates fields  within row
	keySeparator: '',				// separates value from key
	rowSkip: 0,							// rows to skip
	fieldSkip: 0,						// fields to skip within row
	rowHandler: null,				// row evaluation
		
	// parses the submitted text
	// may return null when text doesn't satisfy filter conditions
	parse: function (text) {
		// returning on empty input
		if (text.length === 0) {
			return [];
		}
		
		var	rows = this.rowSeparator ? text.split(this.rowSeparator) : [text],
				first = rows[0],
				result = [],
				fields, row,
				i, j, tmp;
		
		// trimming first row -
		// the rest can be controlled from separators
		rows[0] = first.slice(first.search(/[^\s]/));

		// parsing rows
		for (j = this.rowSkip; j < rows.length; j++) {
			fields = rows[j].split(this.fieldSeparator);
			row = {};
			for (i = this.fieldSkip; i < fields.length; i++) {
				tmp = fields[i].split(this.keySeparator);
				row[tmp[0]] = tmp[1];
			}
			if (this.rowHandler && !this.rowHandler(row)) {
				continue;
			}
			result.push(row);
		}
		return result;
	}
};

// exports
exports.parser = parser;

