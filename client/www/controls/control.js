////////////////////////////////////////////////////////////////////////////////
// Control Base
//
// 'Abstract' base class for UI controls.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $) {
	var LAST_ID = 0;
	
	// generates a new, unique control id
	controls.id = function () {
		return LAST_ID++;
	};
	
	// control lookup (id -> control)
	controls.lookup = {};
	
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
			
			// adds control to parent as child
			appendTo: function (parent) {
				this.parent = parent;
				parent.children.push(this);
				return this;
			},
			
			// removes child controls
			clear: function () {
				this.children.length = 0;
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
			// -parent: parent jQuery object
			render: function (parent) {
				// initializing jQuery object from full control markup
				var elem = $(this.html()),
						target = $('#' + this.id);

				// adding control to dom
				if (target.length) {
					target.replaceWith(elem);
				} else if (parent) {
					parent.append(elem);
				}

				// walking control tree initializing nodes
				(function inner(control) {
					var selector = '#' + control.id,
							i,
					// initializing current control
					result = control.init ? control.init(elem.is(selector) ? elem : elem.find(selector)) : true;
					// initializing children
					if (control.children.length) {
						for (i = 0; i < control.children.length; i++) {
							// when a control.init() returns false, it breaks the init cycle
							// for its siblings -> useful in conj. with jQuery.live()
							if (inner(control.children[i]) === false) {
								break;
							}
						}
					}
					return result;
				}(this));
				
				return parent || elem;
			}			
		};
		
		// adding control to lookup
		controls.lookup[id] = self;

		return self;
	};

	return controls;
}(controls || {},
	jQuery);
