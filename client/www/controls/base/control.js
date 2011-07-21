////////////////////////////////////////////////////////////////////////////////
// Control Base
//
// 'Abstract' base class for UI controls.
////////////////////////////////////////////////////////////////////////////////
/*global jQuery */
var yalp = yalp || {};

yalp.controls = function (controls, $) {
	var LAST_ID = 0,	// next control id to be assigned
			COUNT = 0;	  // total number of controls attached
	
	// generates a new, unique control id
	controls.id = function () {
		return 'y' + LAST_ID++;
	};
	
	// control lookup (id -> control)
	controls.lookup = {};
	
	// getter for control count
	controls.count = function () {
		return COUNT;
	};
	
	// base control class
	controls.control = function () {
		var id = controls.id(),
		
		self =  {
			// properties
			id: id,							// id is automatically assigned
			parent: null,				// parent control
			children: [],				// child controls
			data: [],						// data associated with control
	
			// adds a child to the control
			append: function (child) {
				this.children.push(child);
				child.parent = this;
				return this;
			},
			
			// removes control and frees resources
			remove: function () {
				this.clear();
				if (controls.lookup.hasOwnProperty(this.id)) {
					delete controls.lookup[this.id];
					COUNT--;
				}
				return this;
			},
			
			// adds control to parent as child
			appendTo: function (parent) {
				this.parent = parent;
				parent.children.push(this);
				return this;
			},
			
			// removes child controls
			clear: function () {
				var children = this.children,
						i;
				for (i = 0; i < children.length; i++) {
					children[i].remove();
				}
				children.length = 0;
				return this;
			},
			
			// initializes the control
			// e.g. adding data, events, etc.
			init: null,
			
			// produces the control's html
			html: function () {
				throw "Abstract";
			},
			
			// renders the control
			// - parent: parent jQuery object
			render: function (parent) {
				// initializing jQuery object from full control markup
				var elem = $(this.html()),
						target = $('#' + this.id);

				// adding control to dom
				if (target.length) {
					if (controls.lookup.hasOwnProperty(this.id)) {
						// replacing when already exists
						target.replaceWith(elem);
					} else {
						// removing it when destroyed at control level
						target.remove();
						return;
					}
				} else if (parent) {
					// appending to parent when doesn't exist yet
					parent.append(elem);
				}

				// applying instance-level events
				(function inner(control) {
					var selector = '#' + control.id,
							i,
					// initializing current control
					result = !control.init ? true :
						control.init(elem.is(selector) ? elem : elem.find(selector));
					// initializing children
					for (i = 0; i < control.children.length; i++) {
						inner(control.children[i]);
					}
					return result;
				}(this));
				
				return parent || elem;
			}
		};
		
		// adding control to lookup
		controls.lookup[id] = self;
		COUNT++;

		return self;
	};

	return controls;
}(yalp.controls || {},
	jQuery);
