////////////////////////////////////////////////////////////////////////////////
// Control Base
//
// 'Abstract' base class for UI controls.
////////////////////////////////////////////////////////////////////////////////
var controls = function (controls, $) {
	var LAST_ID = 0;
	
	controls.id = function () {
		return LAST_ID++;
	};
	
	controls.base = function () {
		var self =  {
			// properties
			id: controls.id(),	// id is automatically assigned
			parent: null,				// parent control
			children: [],				// child controls
	
			// adds a child to the control
			append: function (child) {
				this.children.push(child);
				child.parent = this;
			},
			
			// removes child controls
			clear: function () {
				this.children.length = 0;
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
							if (inner(control.children[i]) === false) {
								break;
							}
						}
					}
					return result;
				}(this));
				
				return elem;
			}			
		};

		return self;
	};

	return controls;
}(controls || {},
	jQuery);
