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
			id: controls.id(),
			selector: null,
			parent: null,
			children: [],
	
			// adds a child to the control
			append: function (child) {
				this.children.push(child);
				child.parent = this;
			},
			
			// initializes the control
			// e.g. adding data, events, etc.
			init: function (target, selector) {
				throw "Abstract";
			},
			
			// produces the control's html
			html: function () {
				throw "Abstract";
			},
			
			// renders the control
			render: function () {
				// initializing jQuery object from full control markup
				var elem = $(this.html()),
						target = $('#' + this.id);

				if (target) {
					target.replaceWith(elem);
				}

				// internal tree walker
				(function inner(control) {
					var i, child,
					// initializing current control
					result = control.selector ? 
						control.init(elem, this.selector) :
						true;
					// initializing children
					if (control.children.lengh) {
						for (i = 0; i < control.children; i++) {
							// when a control.init() returns false, it breaks the init cycle
							// for its siblings -> useful in conj. with jQuery.live()
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
