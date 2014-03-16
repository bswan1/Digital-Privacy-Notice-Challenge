/*
 * QueryLoader v2 - A simple script to create a preloader for images
 *
 * For instructions read the original post:
 * http://www.gayadesign.com/diy/queryloader2-preload-your-images-with-ease/
 *
 * Copyright (c) 2011 - Gaya Kessler
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  2.9.0
 * Last update: 2014-01-31
 */
(function($){/*!
 * eventie v1.0.5
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *

	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (evt instanceof RegExp) {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (evt instanceof RegExp) {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return EventEmitter;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
	}
}.call(this));

/*!
 * imagesLoaded v3.1.4
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( [
      'eventEmitter/EventEmitter',
      'eventie/eventie'
    ], function( EventEmitter, eventie ) {
      return factory( window, EventEmitter, eventie );
    });
  } else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = factory(
      window,
      require('eventEmitter'),
      require('eventie')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EventEmitter,
      window.eventie
    );
  }

})( this,

// --------------------------  factory -------------------------- //

function factory( window, EventEmitter, eventie ) {

'use strict';

var $ = window.jQuery;
var console = window.console;
var hasConsole = typeof console !== 'undefined';

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

var objToString = Object.prototype.toString;
function isArray( obj ) {
  return objToString.call( obj ) === '[object Array]';
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length === 'number' ) {
    // convert nodeList to array
    for ( var i=0, len = obj.length; i < len; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

  // -------------------------- imagesLoaded -------------------------- //

  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  function ImagesLoaded( elem, options, onAlways ) {
    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
    if ( !( this instanceof ImagesLoaded ) ) {
      return new ImagesLoaded( elem, options );
    }
    // use elem as selector string
    if ( typeof elem === 'string' ) {
      elem = document.querySelectorAll( elem );
    }

    this.elements = makeArray( elem );
    this.options = extend( {}, this.options );

    if ( typeof options === 'function' ) {
      onAlways = options;
    } else {
      extend( this.options, options );
    }

    if ( onAlways ) {
      this.on( 'always', onAlways );
    }

    this.getImages();

    if ( $ ) {
      // add jQuery Deferred object
      this.jqDeferred = new $.Deferred();
    }

    // HACK check async to allow time to bind listeners
    var _this = this;
    setTimeout( function() {
      _this.check();
    });
  }

  ImagesLoaded.prototype = new EventEmitter();

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function() {
    this.images = [];

    // filter & find items if we have an item selector
    for ( var i=0, len = this.elements.length; i < len; i++ ) {
      var elem = this.elements[i];
      // filter siblings
      if ( elem.nodeName === 'IMG' ) {
        this.addImage( elem );
      }
      // find children
      var childElems = elem.querySelectorAll('img');
      // concat childElems to filterFound array
      for ( var j=0, jLen = childElems.length; j < jLen; j++ ) {
        var img = childElems[j];
        this.addImage( img );
      }
    }
  };

  /**
   * @param {Image} img
   */
  ImagesLoaded.prototype.addImage = function( img ) {
    var loadingImage = new LoadingImage( img );
    this.images.push( loadingImage );
  };

  ImagesLoaded.prototype.check = function() {
    var _this = this;
    var checkedCount = 0;
    var length = this.images.length;
    this.hasAnyBroken = false;
    // complete if no images
    if ( !length ) {
      this.complete();
      return;
    }

    function onConfirm( image, message ) {
      if ( _this.options.debug && hasConsole ) {
        
      }

      _this.progress( image );
      checkedCount++;
      if ( checkedCount === length ) {
        _this.complete();
      }
      return true; // bind once
    }

    for ( var i=0; i < length; i++ ) {
      var loadingImage = this.images[i];
      loadingImage.on( 'confirm', onConfirm );
      loadingImage.check();
    }
  };

  ImagesLoaded.prototype.progress = function( image ) {
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
    // HACK - Chrome triggers event before object properties have changed. #83
    var _this = this;
    setTimeout( function() {
      _this.emit( 'progress', _this, image );
      if ( _this.jqDeferred && _this.jqDeferred.notify ) {
        _this.jqDeferred.notify( _this, image );
      }
    });
  };

  ImagesLoaded.prototype.complete = function() {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    var _this = this;
    // HACK - another setTimeout so that confirm happens after progress
    setTimeout( function() {
      _this.emit( eventName, _this );
      _this.emit( 'always', _this );
      if ( _this.jqDeferred ) {
        var jqMethod = _this.hasAnyBroken ? 'reject' : 'resolve';
        _this.jqDeferred[ jqMethod ]( _this );
      }
    });
  };

  // -------------------------- jquery -------------------------- //

  if ( $ ) {
    $.fn.imagesLoaded = function( options, callback ) {
      var instance = new ImagesLoaded( this, options, callback );
      return instance.jqDeferred.promise( $(this) );
    };
  }


  // --------------------------  -------------------------- //

  function LoadingImage( img ) {
    this.img = img;
  }

  LoadingImage.prototype = new EventEmitter();

  LoadingImage.prototype.check = function() {
    // first check cached any previous images that have same src
    var resource = cache[ this.img.src ] || new Resource( this.img.src );
    if ( resource.isConfirmed ) {
      this.confirm( resource.isLoaded, 'cached was confirmed' );
      return;
    }

    // If complete is true and browser supports natural sizes,
    // try to check for image status manually.
    if ( this.img.complete && this.img.naturalWidth !== undefined ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }

    // If none of the checks above matched, simulate loading on detached element.
    var _this = this;
    resource.on( 'confirm', function( resrc, message ) {
      _this.confirm( resrc.isLoaded, message );
      return true;
    });

    resource.check();
  };

  LoadingImage.prototype.confirm = function( isLoaded, message ) {
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  // -------------------------- Resource -------------------------- //

  // Resource checks each src, only once
  // separate class from LoadingImage to prevent memory leaks. See #115

  var cache = {};

  function Resource( src ) {
    this.src = src;
    // add to cache
    cache[ src ] = this;
  }

  Resource.prototype = new EventEmitter();

  Resource.prototype.check = function() {
    // only trigger checking once
    if ( this.isChecked ) {
      return;
    }
    // simulate loading on detached element
    var proxyImage = new Image();
    eventie.bind( proxyImage, 'load', this );
    eventie.bind( proxyImage, 'error', this );
    proxyImage.src = this.src;
    // set flag
    this.isChecked = true;
  };

  // ----- events ----- //

  // trigger specified handler for event type
  Resource.prototype.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };

  Resource.prototype.onload = function( event ) {
    this.confirm( true, 'onload' );
    this.unbindProxyEvents( event );
  };

  Resource.prototype.onerror = function( event ) {
    this.confirm( false, 'onerror' );
    this.unbindProxyEvents( event );
  };

  // ----- confirm ----- //

  Resource.prototype.confirm = function( isLoaded, message ) {
    this.isConfirmed = true;
    this.isLoaded = isLoaded;
    this.emit( 'confirm', this, message );
  };

  Resource.prototype.unbindProxyEvents = function( event ) {
    eventie.unbind( event.target, 'load', this );
    eventie.unbind( event.target, 'error', this );
  };

  // -----  ----- //

  return ImagesLoaded;

});

function OverlayLoader(parent) {
	this.parent = parent;
	this.container;
	this.loadbar;
	this.percentageContainer;
};

OverlayLoader.prototype.createOverlay = function () {
	

	//determine postion of overlay and set parent position
	var overlayPosition = "absolute";

	if (this.parent.element.tagName.toLowerCase() == "body") {
		overlayPosition = "fixed";
	} else {
		var pos = this.parent.$element.css("position");
		if (pos != "fixed" || pos != "absolute") {
			this.parent.$element.css("position", "relative");
		}
	}

	//create the overlay container
	/*this.container = $("<div id='" + this.parent.options.overlayId + "'></div>").css({
		width: "100%",
		height: "100%",
		backgroundColor: this.parent.options.backgroundColor,
		backgroundPosition: "fixed",
		position: overlayPosition,
		zIndex: 666999, //very high!
		top: 0,
		left: 0
	}).appendTo(this.parent.$element);*/

	//create the loading bar

	//this.loadbar = $('<div class="preloader_img"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="210.667px" height="246.333px" viewBox="0 0 210.667 246.333" enable-background="new 0 0 210.667 246.333" xml:space="preserve"><g><g><path fill="#4D4D4D" d="M2.736,126.961c0.028-0.048,0.03-0.102,0.052-0.151c0.034-0.081,0.065-0.161,0.083-0.247c0.016-0.081,0.017-0.16,0.017-0.242c0.001-0.08,0-0.158-0.016-0.239c-0.018-0.087-0.049-0.167-0.083-0.249c-0.021-0.05-0.024-0.104-0.052-0.15l-0.6-1.043c-0.174,1.414-0.333,2.808-0.478,4.178L2.736,126.961z"/><path fill="#4D4D4D" d="M41.359,215.461c-0.612-0.354-1.395-0.143-1.747,0.47l-2.889,5.009h-3.488c0.614,0.636,1.501,1.515,2.636,2.558h0.854l0.913,1.576c1.424,1.229,3.13,2.603,5.087,4.043h3.736l2.372,4.115c0.738,0.452,1.495,0.904,2.278,1.355c0.599-0.355,0.805-1.128,0.455-1.734l-3.626-6.294h-6.482l-2.518-4.341l2.888-5.011C42.181,216.595,41.971,215.813,41.359,215.461z"/><path fill="#4D4D4D" d="M30.208,108.112l-3.255,5.617h-6.518l-3.258,5.653h-5.04l-3.256-5.653H3.693c-0.141,0.861-0.271,1.71-0.4,2.558h4.109l2.521,4.374l-2.891,5.021c-0.027,0.047-0.03,0.101-0.05,0.15c-0.034,0.082-0.066,0.162-0.083,0.249c-0.015,0.081-0.016,0.159-0.016,0.239c0,0.082,0.002,0.161,0.018,0.242c0.016,0.086,0.049,0.166,0.083,0.247c0.021,0.05,0.023,0.104,0.051,0.151l3.258,5.617c0.054,0.094,0.12,0.174,0.192,0.248c0.005,0.004,0.008,0.012,0.014,0.017c0.105,0.104,0.229,0.181,0.36,0.243c0.033,0.016,0.065,0.026,0.1,0.039c0.141,0.053,0.287,0.089,0.438,0.09c0.001,0,0.001,0,0.002,0h5.778l2.521,4.373l-2.521,4.381h-6.515l-3.258,5.615H0.889l-0.423,0.734c-0.021,1.746-0.017,3.45,0.014,5.104l1.889-3.279h5.774h0.001c0.152-0.002,0.298-0.038,0.439-0.09c0.034-0.013,0.067-0.023,0.1-0.041c0.132-0.061,0.255-0.137,0.361-0.24c0.005-0.007,0.007-0.013,0.012-0.018c0.073-0.073,0.139-0.156,0.193-0.248l2.887-4.98h6.521l3.258-5.657h5.776c0.706,0,1.279-0.573,1.279-1.28c0-0.706-0.573-1.278-1.279-1.278h-5.777l-3.257-5.652h-6.521l-2.517-4.34l2.52-4.377h6.518l3.258-5.653h5.036l2.519,4.376l-2.519,4.378h-5.776c-0.707,0-1.279,0.572-1.279,1.279c0,0.705,0.572,1.277,1.279,1.277h5.778l2.885,4.98c0.237,0.408,0.667,0.637,1.108,0.637c0.217,0,0.438-0.056,0.64-0.172c0.611-0.355,0.819-1.137,0.465-1.749l-2.884-4.977l2.886-5.018c0.028-0.047,0.029-0.1,0.049-0.148c0.035-0.082,0.067-0.162,0.083-0.25c0.016-0.08,0.018-0.158,0.018-0.24s-0.002-0.16-0.018-0.24c-0.016-0.088-0.048-0.166-0.083-0.247c-0.021-0.05-0.021-0.103-0.049-0.149l-2.886-5.014l2.514-4.34h6.521l3.257-5.653h5.001l2.889,5.014c0.353,0.611,1.132,0.821,1.747,0.469c0.612-0.352,0.823-1.134,0.469-1.746l-3.626-6.295h-6.482l-2.518-4.341l2.888-5.01c0.353-0.613,0.143-1.396-0.469-1.748c-0.614-0.354-1.395-0.143-1.747,0.47l-3.257,5.651c-0.028,0.047-0.029,0.101-0.05,0.15c-0.034,0.083-0.067,0.162-0.083,0.25c-0.017,0.08-0.017,0.158-0.017,0.238c0,0.082,0.001,0.162,0.017,0.242c0.017,0.089,0.049,0.167,0.084,0.249c0.021,0.05,0.023,0.103,0.05,0.149l2.887,4.98l-2.52,4.371H30.208z"/><path fill="#4D4D4D" d="M18.654,167.067l3.257-5.615h5.779c0,0,0.001,0,0.002,0c0.151-0.003,0.297-0.038,0.438-0.089c0.034-0.014,0.067-0.026,0.101-0.042c0.13-0.061,0.255-0.138,0.361-0.242c0.004-0.005,0.006-0.009,0.01-0.015c0.074-0.074,0.141-0.156,0.196-0.254l3.255-5.653c0.352-0.612,0.142-1.394-0.471-1.747c-0.613-0.353-1.394-0.142-1.747,0.471l-2.885,5.012h-6.513l-3.257,5.616h-5.044l-3.257-5.616H2.367l-1.832-3.18c0.063,1.871,0.159,3.676,0.284,5.428c0.084,0.068,0.17,0.135,0.268,0.181c0.033,0.016,0.067,0.028,0.101,0.042c0.141,0.051,0.288,0.086,0.438,0.089c0.001,0,0.002,0,0.002,0h5.776l2.516,4.339l-2.887,5.012c-0.027,0.047-0.029,0.1-0.049,0.146c-0.035,0.084-0.068,0.164-0.084,0.253c-0.016,0.08-0.018,0.158-0.018,0.24c0,0.08,0.002,0.159,0.018,0.239c0.016,0.088,0.049,0.168,0.084,0.252c0.021,0.048,0.022,0.101,0.049,0.147l2.889,5.012l-2.888,4.977c-0.354,0.61-0.146,1.393,0.465,1.748c0.61,0.355,1.394,0.146,1.749-0.464l2.887-4.979h5.044l2.517,4.34l-2.889,5.016c-0.027,0.047-0.03,0.101-0.05,0.149c-0.035,0.082-0.066,0.162-0.083,0.249c-0.016,0.082-0.017,0.159-0.017,0.24c0,0.082,0.001,0.16,0.018,0.242c0.017,0.086,0.048,0.164,0.082,0.244c0.022,0.05,0.024,0.105,0.053,0.154l2.886,4.976l-2.889,5.02c-0.352,0.61-0.142,1.393,0.471,1.746c0.201,0.114,0.42,0.17,0.637,0.17c0.443,0,0.873-0.229,1.11-0.641l2.889-5.017h5.035l2.886,5.017c0.354,0.612,1.134,0.821,1.746,0.471c0.613-0.352,0.824-1.135,0.472-1.746l-2.886-5.02l2.514-4.339h5.781c0.706,0,1.279-0.572,1.279-1.278c0-0.708-0.573-1.279-1.279-1.279h-7.255l-3.255,5.616h-5.042l-2.517-4.34l2.889-5.015c0.028-0.048,0.03-0.101,0.05-0.152c0.035-0.082,0.067-0.16,0.083-0.248c0.016-0.081,0.017-0.159,0.017-0.239c0-0.083-0.001-0.162-0.018-0.242c-0.016-0.086-0.048-0.164-0.082-0.245c-0.021-0.051-0.023-0.105-0.052-0.153l-3.627-6.253h-6.517l-2.521-4.374l2.521-4.375H18.654z"/><path fill="#4D4D4D" d="M2.786,170.949c-0.021-0.047-0.022-0.1-0.049-0.146l-1.148-1.993c0.189,1.436,0.396,2.833,0.625,4.178l0.522-0.906c0.027-0.047,0.029-0.1,0.049-0.147c0.035-0.084,0.067-0.164,0.084-0.252c0.016-0.08,0.017-0.159,0.017-0.239c0-0.082-0.001-0.16-0.017-0.24C2.853,171.113,2.821,171.033,2.786,170.949z"/><path fill="#4D4D4D" d="M86.292,240.423c0.056,0,0.105-0.024,0.158-0.032c0.086-0.011,0.168-0.022,0.251-0.05c0.08-0.026,0.151-0.067,0.223-0.11c0.07-0.037,0.135-0.076,0.195-0.13c0.07-0.06,0.123-0.129,0.179-0.201c0.031-0.043,0.075-0.069,0.101-0.117l2.891-5.013h5.039l2.888,5.013c0.237,0.411,0.667,0.641,1.109,0.641c0.218,0,0.437-0.055,0.638-0.17c0.612-0.354,0.822-1.134,0.468-1.746l-2.888-5.015l2.521-4.376h2.536l0.052-2.558h-4.066l-3.257,5.653H88.81l-3.257,5.653h-5.04l-3.253-5.653h-6.519l-3.257-5.653h-6.517l-3.26-5.619h-6.51l-2.521-4.371l2.891-5.02c0.027-0.048,0.03-0.103,0.05-0.151c0.034-0.082,0.066-0.161,0.083-0.249c0.015-0.081,0.016-0.158,0.016-0.24s-0.002-0.16-0.017-0.242c-0.017-0.086-0.048-0.162-0.083-0.244c-0.021-0.05-0.023-0.105-0.051-0.154l-2.888-4.976l2.52-4.372h6.513l3.629-6.299c0.028-0.049,0.03-0.102,0.05-0.151c0.035-0.082,0.067-0.16,0.083-0.247c0.015-0.082,0.018-0.16,0.016-0.242c0-0.082-0.001-0.16-0.016-0.24c-0.019-0.087-0.049-0.168-0.085-0.249c-0.021-0.049-0.023-0.103-0.05-0.15l-2.89-4.977l2.891-5.015c0.028-0.048,0.03-0.101,0.05-0.148c0.035-0.083,0.068-0.163,0.084-0.252c0.015-0.081,0.016-0.16,0.016-0.241s-0.001-0.158-0.016-0.24c-0.018-0.088-0.05-0.168-0.086-0.25c-0.021-0.05-0.022-0.102-0.049-0.148l-2.888-4.977l2.521-4.373h5.777c0,0,0.001,0,0.002,0c0.151,0,0.297-0.037,0.438-0.088c0.035-0.014,0.068-0.025,0.102-0.041c0.13-0.062,0.254-0.138,0.359-0.242c0.005-0.005,0.008-0.013,0.013-0.019c0.073-0.074,0.139-0.156,0.193-0.249l2.889-5.014h5.039l2.518,4.375l-2.887,5.015c-0.352,0.613-0.142,1.395,0.471,1.747c0.615,0.351,1.395,0.141,1.746-0.472l2.884-5.013h5.04l2.518,4.373l-2.516,4.34h-6.521l-3.252,5.655h-5.039l-2.52-4.374l2.886-4.978c0.354-0.609,0.147-1.394-0.464-1.748c-0.611-0.355-1.395-0.146-1.748,0.465l-3.258,5.616c-0.028,0.048-0.031,0.103-0.051,0.153c-0.035,0.081-0.067,0.159-0.083,0.245c-0.016,0.08-0.018,0.159-0.018,0.242c0,0.08,0.001,0.158,0.016,0.239c0.018,0.088,0.048,0.166,0.083,0.248c0.021,0.052,0.023,0.104,0.05,0.152l2.889,5.015l-2.887,4.977c-0.028,0.048-0.031,0.104-0.051,0.153c-0.035,0.082-0.067,0.159-0.083,0.245c-0.016,0.081-0.018,0.159-0.018,0.242c0,0.081,0.001,0.159,0.016,0.239c0.018,0.089,0.048,0.167,0.083,0.249c0.021,0.05,0.023,0.104,0.05,0.151l2.891,5.02l-2.521,4.374h-5.776c-0.707,0-1.28,0.572-1.28,1.279s0.573,1.28,1.28,1.28h5.778l2.888,4.978c0.237,0.408,0.667,0.638,1.107,0.638c0.218,0,0.438-0.055,0.641-0.172c0.611-0.355,0.819-1.138,0.464-1.75l-2.887-4.976l2.889-5.013c0.027-0.047,0.029-0.099,0.049-0.148c0.035-0.082,0.067-0.162,0.084-0.25c0.016-0.08,0.017-0.158,0.017-0.24c0.001-0.08-0.001-0.159-0.017-0.24c-0.018-0.088-0.049-0.167-0.083-0.249c-0.021-0.05-0.023-0.101-0.051-0.147l-2.888-5.02l2.517-4.339h5.043l2.883,4.978c0.354,0.612,1.137,0.822,1.748,0.467c0.611-0.354,0.82-1.137,0.465-1.748l-2.882-4.978l2.516-4.374h5.04l3.257,5.655h6.521l2.516,4.339l-2.888,5.02c-0.352,0.61-0.142,1.393,0.47,1.746c0.203,0.114,0.421,0.17,0.637,0.17c0.443,0,0.874-0.229,1.11-0.641l3.257-5.658c0.028-0.047,0.031-0.102,0.052-0.151c0.034-0.082,0.065-0.16,0.083-0.249c0.014-0.08,0.018-0.158,0.015-0.239c0-0.083-0.001-0.161-0.017-0.242c-0.016-0.086-0.048-0.163-0.083-0.245c-0.021-0.05-0.023-0.105-0.051-0.153l-2.887-4.977l2.52-4.374h3.399l0.043-2.558h-4.92l-3.257,5.655H90.29l-2.521-4.374l2.888-4.978c0.028-0.048,0.031-0.103,0.051-0.151c0.034-0.081,0.067-0.16,0.084-0.247c0.016-0.08,0.017-0.16,0.017-0.242c0-0.08-0.001-0.158-0.017-0.239c-0.017-0.088-0.05-0.17-0.085-0.252c-0.02-0.049-0.022-0.101-0.05-0.147l-3.625-6.295h-6.518l-3.253-5.653H70.74l-2.517-4.339l2.52-4.371h5.778c0.001,0,0.001,0,0.003,0c0.151-0.002,0.297-0.037,0.438-0.089c0.034-0.015,0.067-0.026,0.1-0.041c0.131-0.062,0.256-0.138,0.361-0.242c0.003-0.007,0.005-0.011,0.01-0.015c0.073-0.076,0.141-0.158,0.195-0.256l2.884-5.014h5.779c0.706,0,1.279-0.573,1.279-1.279c0-0.707-0.573-1.279-1.279-1.279h-5.782l-2.513-4.34l2.516-4.376h5.779c0,0,0,0,0.002,0c0.15-0.002,0.295-0.036,0.438-0.089c0.035-0.014,0.067-0.025,0.102-0.041c0.13-0.063,0.254-0.137,0.358-0.242c0.007-0.006,0.009-0.013,0.015-0.018c0.072-0.074,0.139-0.158,0.192-0.25l3.257-5.652c0.028-0.049,0.031-0.102,0.05-0.15c0.035-0.083,0.068-0.163,0.085-0.252c0.016-0.08,0.017-0.158,0.017-0.238c0-0.082-0.001-0.16-0.017-0.243c-0.017-0.087-0.05-0.165-0.085-0.246c-0.02-0.051-0.022-0.104-0.05-0.152l-3.627-6.253h-6.515l-3.253-5.658h-6.519l-2.52-4.372l2.517-4.34h5.781c0.707,0,1.279-0.572,1.279-1.278s-0.572-1.28-1.279-1.28h-7.254l-3.628,6.254c-0.028,0.049-0.031,0.103-0.051,0.152c-0.035,0.082-0.067,0.16-0.083,0.246c-0.016,0.082-0.018,0.16-0.018,0.244c0,0.08,0.001,0.156,0.016,0.236c0.018,0.091,0.05,0.171,0.085,0.254c0.021,0.049,0.022,0.101,0.049,0.146l3.626,6.295h6.518l2.883,5.017c0.055,0.097,0.124,0.182,0.198,0.26c0.003,0.002,0.005,0.006,0.008,0.009c0.105,0.104,0.23,0.182,0.361,0.243c0.033,0.017,0.066,0.029,0.1,0.041c0.142,0.051,0.288,0.088,0.438,0.088c0.002,0,0.002,0,0.003,0h5.781l2.516,4.34l-2.518,4.372h-6.52l-3.253,5.659h-6.514l-3.258,5.615h-5.042l-2.519-4.34l2.89-5.017c0.028-0.048,0.03-0.101,0.049-0.149c0.036-0.082,0.067-0.162,0.084-0.248c0.015-0.081,0.018-0.159,0.016-0.242c0-0.082-0.001-0.158-0.016-0.24c-0.018-0.088-0.049-0.166-0.084-0.248c-0.021-0.051-0.022-0.103-0.05-0.15l-2.889-5.012l2.519-4.34h5.042l2.517,4.34l-2.888,5.012c-0.354,0.613-0.143,1.396,0.47,1.748c0.201,0.115,0.42,0.171,0.637,0.171c0.442,0,0.873-0.229,1.109-0.64l2.889-5.014h5.778c0.707,0,1.279-0.572,1.279-1.279c0-0.706-0.572-1.278-1.279-1.278H70.74l-3.257-5.616H60.97l-2.523-4.38l2.892-5.014c0.028-0.049,0.031-0.102,0.05-0.151c0.036-0.082,0.068-0.161,0.084-0.249c0.015-0.08,0.016-0.158,0.016-0.241c0-0.081-0.001-0.159-0.016-0.24c-0.018-0.089-0.049-0.167-0.085-0.249c-0.021-0.05-0.023-0.104-0.05-0.15l-2.888-4.976l2.521-4.373h5.777c0.058,0,0.108-0.025,0.165-0.032c0.082-0.012,0.161-0.021,0.24-0.049c0.083-0.029,0.156-0.068,0.23-0.111c0.068-0.041,0.13-0.078,0.191-0.129c0.069-0.06,0.123-0.127,0.177-0.199c0.033-0.043,0.076-0.07,0.104-0.117l2.887-4.98h5.043l2.883,4.98c0.054,0.092,0.12,0.173,0.191,0.246c0.006,0.007,0.009,0.015,0.016,0.02c0.104,0.105,0.229,0.182,0.359,0.242c0.033,0.016,0.066,0.028,0.101,0.041c0.141,0.053,0.288,0.088,0.438,0.088c0.001,0,0.001,0.001,0.002,0.001h5.779l2.518,4.372l-2.516,4.34h-5.781c-0.707,0-1.279,0.572-1.279,1.279c0,0.705,0.572,1.278,1.279,1.278h5.779l3.257,5.653h6.519l2.518,4.377l-2.885,4.977c-0.029,0.048-0.032,0.102-0.052,0.152c-0.034,0.081-0.067,0.159-0.083,0.246c-0.016,0.083-0.017,0.161-0.017,0.243c0,0.08,0,0.158,0.015,0.238c0.017,0.089,0.049,0.169,0.084,0.252c0.021,0.049,0.022,0.102,0.049,0.15l2.891,5.012l-2.52,4.381H89.55c-0.707,0-1.279,0.572-1.279,1.279s0.572,1.277,1.279,1.277h7.257l3.257-5.657h4.153l0.032-1.924v-0.635h-4.186l-2.519-4.372l2.887-4.977c0.028-0.048,0.03-0.102,0.051-0.151c0.034-0.081,0.067-0.161,0.084-0.247c0.014-0.081,0.015-0.16,0.015-0.242c0.002-0.08-0.001-0.158-0.015-0.239c-0.018-0.087-0.049-0.167-0.083-0.249c-0.021-0.05-0.024-0.104-0.052-0.15l-3.625-6.299H90.29l-2.521-4.372l2.888-4.977c0.028-0.048,0.031-0.102,0.05-0.152c0.035-0.08,0.068-0.158,0.085-0.247c0.016-0.082,0.017-0.16,0.017-0.242c0-0.08-0.001-0.158-0.017-0.239c-0.017-0.088-0.05-0.168-0.085-0.25c-0.02-0.05-0.022-0.103-0.05-0.149l-2.888-5.013l2.888-4.98c0.354-0.609,0.146-1.393-0.465-1.748c-0.611-0.354-1.393-0.146-1.747,0.467l-2.889,4.979h-5.044l-2.513-4.341l2.884-5.013c0.027-0.047,0.029-0.099,0.049-0.147c0.035-0.082,0.067-0.162,0.084-0.249c0.016-0.082,0.018-0.16,0.017-0.24c0.001-0.082-0.001-0.16-0.017-0.24c-0.018-0.089-0.049-0.167-0.084-0.249c-0.021-0.049-0.022-0.103-0.049-0.149l-3.621-6.295h-7.258c-0.707,0-1.279,0.572-1.279,1.278c0,0.707,0.572,1.279,1.279,1.279h5.778l2.517,4.376l-2.517,4.372h-6.515l-3.258,5.618h-5.042l-3.26-5.618h-6.51l-2.521-4.372l2.891-5.017c0.027-0.047,0.03-0.101,0.05-0.15c0.034-0.083,0.066-0.162,0.083-0.249c0.015-0.081,0.016-0.159,0.016-0.239c0-0.082-0.002-0.162-0.017-0.242c-0.017-0.087-0.048-0.165-0.083-0.245c-0.021-0.052-0.023-0.105-0.051-0.153l-3.627-6.254h-6.479l-3.257-5.654h-6.518l-3.255-5.652h-7.254c-0.707,0-1.279,0.572-1.279,1.279s0.572,1.279,1.279,1.279h5.776l2.519,4.374l-2.888,5.015c-0.353,0.612-0.142,1.395,0.47,1.746s1.394,0.143,1.747-0.469l2.886-5.014h5.039l2.52,4.372l-2.518,4.34h-6.52l-3.255,5.653h-5.036l-2.889-5.012c-0.353-0.613-1.135-0.822-1.747-0.471s-0.823,1.134-0.471,1.746l3.258,5.654c0.054,0.094,0.122,0.177,0.194,0.252c0.005,0.005,0.007,0.012,0.012,0.017c0.105,0.104,0.229,0.181,0.36,0.242c0.033,0.017,0.066,0.028,0.101,0.041c0.141,0.052,0.287,0.089,0.438,0.089c0.002,0,0.002,0,0.003,0h5.776l2.518,4.371l-2.516,4.341h-5.042l-3.257-5.618h-6.517l-2.52-4.372l2.889-5.017c0.028-0.047,0.03-0.101,0.051-0.15c0.035-0.083,0.066-0.162,0.083-0.249c0.016-0.081,0.018-0.159,0.017-0.239c0-0.082-0.001-0.162-0.017-0.242c-0.018-0.087-0.049-0.165-0.083-0.245c-0.022-0.052-0.024-0.105-0.053-0.153l-2.173-3.748l-0.858,3.62l0.447,0.771L8.85,88.676l-1.273,5.373l2.715,4.71c0.054,0.095,0.121,0.176,0.193,0.249c0.005,0.007,0.008,0.015,0.015,0.02c0.104,0.104,0.228,0.181,0.358,0.241c0.034,0.017,0.067,0.029,0.103,0.043c0.141,0.052,0.287,0.086,0.438,0.086c0.001,0,0.001,0.002,0.002,0.002h5.781l2.517,4.342l-2.52,4.371h-5.778c-0.707,0-1.279,0.574-1.279,1.28s0.572,1.278,1.279,1.278h7.257l3.258-5.653h5.776l0.001-0.001c0.152,0,0.298-0.035,0.438-0.088c0.035-0.013,0.068-0.025,0.101-0.041c0.131-0.061,0.255-0.137,0.359-0.242c0.006-0.005,0.009-0.013,0.016-0.02c0.072-0.073,0.138-0.154,0.191-0.246l3.255-5.619c0.028-0.047,0.03-0.1,0.051-0.149c0.034-0.082,0.067-0.16,0.083-0.249c0.016-0.08,0.018-0.158,0.018-0.24s-0.001-0.16-0.017-0.241c-0.017-0.087-0.048-0.165-0.083-0.247c-0.021-0.05-0.022-0.104-0.05-0.152l-2.889-5.013l2.519-4.376h6.515l3.258-5.616h5.005l2.518,4.34l-2.888,5.014c-0.028,0.047-0.03,0.101-0.05,0.149c-0.034,0.082-0.066,0.16-0.083,0.249c-0.015,0.08-0.018,0.158-0.017,0.24c0,0.082,0.001,0.16,0.017,0.24c0.018,0.089,0.049,0.167,0.084,0.249c0.021,0.049,0.022,0.102,0.049,0.15l3.258,5.65c0.055,0.095,0.121,0.176,0.193,0.249c0.004,0.007,0.008,0.015,0.013,0.02c0.105,0.104,0.229,0.181,0.36,0.241c0.033,0.017,0.066,0.029,0.102,0.043c0.141,0.052,0.287,0.086,0.438,0.086c0.001,0,0.002,0.002,0.003,0.002h5.776l2.519,4.342l-2.89,5.013c-0.028,0.047-0.03,0.101-0.051,0.151c-0.035,0.082-0.066,0.16-0.083,0.247c-0.017,0.082-0.017,0.16-0.017,0.242c0,0.081,0.001,0.158,0.017,0.24c0.018,0.089,0.049,0.167,0.085,0.249c0.021,0.051,0.022,0.103,0.05,0.15l2.888,4.977l-2.521,4.372h-5.035l-2.889-5.014c-0.352-0.61-1.133-0.823-1.747-0.47c-0.612,0.353-0.822,1.135-0.469,1.748l2.89,5.014l-2.89,5.021c-0.353,0.612-0.142,1.395,0.47,1.746c0.611,0.353,1.394,0.143,1.746-0.469l2.889-5.019h5.034l2.521,4.377l-2.888,4.977c-0.028,0.048-0.03,0.101-0.05,0.149c-0.035,0.083-0.068,0.162-0.085,0.25c-0.015,0.082-0.017,0.16-0.017,0.24c0,0.082,0,0.16,0.017,0.242c0.017,0.087,0.048,0.164,0.083,0.247c0.021,0.05,0.023,0.104,0.051,0.153l2.891,5.012l-2.891,5.021c-0.029,0.049-0.031,0.102-0.052,0.152c-0.034,0.081-0.065,0.16-0.082,0.246c-0.017,0.082-0.018,0.16-0.017,0.242c0,0.082,0.001,0.16,0.017,0.24c0.018,0.087,0.05,0.167,0.084,0.249c0.021,0.05,0.023,0.103,0.051,0.149l2.888,4.977l-2.521,4.375h-5.035l-2.519-4.375l2.886-4.977c0.354-0.611,0.146-1.393-0.465-1.748c-0.611-0.354-1.394-0.147-1.749,0.465l-3.257,5.616c-0.029,0.048-0.031,0.103-0.052,0.153c-0.034,0.081-0.066,0.159-0.083,0.244c-0.015,0.082-0.017,0.162-0.017,0.242c-0.001,0.082,0.001,0.16,0.017,0.24c0.017,0.089,0.048,0.166,0.083,0.248c0.021,0.051,0.022,0.105,0.05,0.152l3.257,5.655c0.056,0.097,0.123,0.179,0.196,0.254c0.004,0.005,0.006,0.009,0.01,0.016c0.106,0.104,0.23,0.181,0.361,0.242c0.033,0.015,0.066,0.026,0.101,0.041c0.142,0.052,0.288,0.087,0.438,0.089c0.001,0,0.002,0,0.003,0h7.251l3.26-5.656h5.777h0.001c0.152-0.002,0.298-0.038,0.439-0.09c0.034-0.013,0.067-0.023,0.099-0.041c0.133-0.061,0.256-0.137,0.362-0.24c0.005-0.007,0.007-0.013,0.012-0.018c0.073-0.073,0.139-0.156,0.193-0.248l2.887-4.98h5.043l2.514,4.34l-2.516,4.375h-6.518l-3.626,6.293c-0.028,0.047-0.03,0.1-0.05,0.15c-0.035,0.082-0.067,0.162-0.084,0.25c-0.015,0.081-0.016,0.158-0.016,0.238c0,0.084,0.002,0.162,0.018,0.242c0.016,0.089,0.049,0.167,0.083,0.248c0.021,0.051,0.023,0.105,0.051,0.152l2.887,4.977l-2.519,4.371h-6.515l-3.259,5.654h-5.774c-0.707,0-1.28,0.571-1.28,1.279c0,0.707,0.573,1.278,1.28,1.278h5.776l2.52,4.34l-2.891,5.016c-0.027,0.047-0.029,0.099-0.049,0.147c-0.035,0.082-0.068,0.162-0.084,0.251c-0.017,0.082-0.017,0.16-0.017,0.241s0.001,0.159,0.017,0.239c0.018,0.089,0.05,0.17,0.085,0.252c0.021,0.048,0.022,0.102,0.05,0.148l2.888,4.976l-2.521,4.378h-6.513l-3.256,5.652h-5.002l-2.521-4.374l2.521-4.378H47.2c0.001,0,0.001,0,0.002,0c0.151-0.002,0.297-0.038,0.438-0.09c0.036-0.013,0.068-0.025,0.102-0.041c0.13-0.062,0.255-0.138,0.359-0.242c0.006-0.006,0.01-0.014,0.016-0.02c0.071-0.073,0.137-0.153,0.19-0.245l3.258-5.616c0.028-0.049,0.031-0.104,0.051-0.154c0.035-0.08,0.067-0.158,0.083-0.244c0.015-0.082,0.017-0.16,0.017-0.242c0-0.081-0.001-0.158-0.016-0.24c-0.018-0.087-0.049-0.167-0.083-0.249c-0.021-0.049-0.023-0.103-0.05-0.149l-3.627-6.297h-6.482l-3.258-5.616h-6.515l-2.519-4.374l2.519-4.375h6.515l3.258-5.615h5.005l2.518,4.339l-2.519,4.371H40.72c-0.707,0-1.279,0.572-1.279,1.28c0,0.706,0.572,1.277,1.279,1.277h6.48c0.001,0,0.001,0,0.003,0c0.15,0,0.296-0.037,0.437-0.088c0.036-0.014,0.069-0.025,0.103-0.041c0.13-0.062,0.254-0.138,0.358-0.242c0.006-0.007,0.01-0.015,0.017-0.021c0.071-0.074,0.137-0.154,0.191-0.248l2.889-5.013h6.51l3.63-6.253c0.354-0.611,0.146-1.395-0.464-1.748c-0.611-0.355-1.394-0.147-1.748,0.465l-2.891,4.978h-5.039l-3.257-5.616h-6.479l-2.521-4.374l2.89-5.017c0.028-0.047,0.031-0.102,0.051-0.152c0.034-0.082,0.066-0.159,0.083-0.248c0.015-0.08,0.017-0.158,0.015-0.24c0-0.08-0.001-0.16-0.016-0.242c-0.017-0.085-0.049-0.163-0.083-0.244c-0.021-0.051-0.023-0.105-0.051-0.153l-2.886-4.978l2.519-4.376H47.2c0.001,0,0.001,0,0.003,0c0.15-0.002,0.296-0.036,0.437-0.089c0.036-0.014,0.069-0.025,0.103-0.041c0.13-0.063,0.254-0.137,0.358-0.242c0.006-0.006,0.009-0.013,0.015-0.018c0.072-0.074,0.139-0.158,0.193-0.25l3.257-5.652c0.354-0.614,0.143-1.396-0.469-1.748c-0.614-0.355-1.394-0.143-1.747,0.468l-2.888,5.014h-5.002l-2.519-4.372l2.886-4.977c0.028-0.048,0.03-0.102,0.051-0.151c0.034-0.081,0.067-0.161,0.083-0.247c0.015-0.081,0.016-0.16,0.016-0.242c0.001-0.08,0-0.158-0.015-0.239c-0.018-0.087-0.049-0.167-0.083-0.249c-0.021-0.05-0.023-0.104-0.051-0.15l-2.89-5.021l2.89-5.014c0.353-0.613,0.143-1.396-0.469-1.748c-0.614-0.354-1.395-0.143-1.747,0.47l-3.257,5.653c-0.027,0.047-0.029,0.1-0.049,0.148c-0.035,0.082-0.067,0.162-0.084,0.25c-0.016,0.082-0.017,0.158-0.017,0.24c-0.001,0.082,0.001,0.16,0.017,0.24c0.017,0.088,0.049,0.168,0.083,0.25c0.021,0.049,0.022,0.102,0.05,0.148l2.888,5.018l-2.887,4.977c-0.028,0.048-0.03,0.102-0.05,0.152c-0.035,0.081-0.067,0.159-0.084,0.246c-0.016,0.083-0.017,0.161-0.017,0.243c0,0.08,0,0.158,0.017,0.238c0.016,0.089,0.049,0.169,0.084,0.252c0.021,0.049,0.021,0.102,0.049,0.15l2.891,5.012l-2.522,4.381h-6.515l-3.255,5.615h-6.518l-3.258,5.656h-5.778c-0.707,0-1.279,0.571-1.279,1.278c0,0.708,0.572,1.28,1.279,1.28h7.257l3.258-5.656h5.776c0.055,0,0.104-0.024,0.158-0.033c0.086-0.01,0.168-0.021,0.25-0.049c0.08-0.029,0.15-0.066,0.222-0.107c0.069-0.041,0.136-0.08,0.196-0.133c0.068-0.06,0.121-0.127,0.175-0.197c0.033-0.043,0.077-0.07,0.104-0.117l2.885-4.98h5.043l2.518,4.34l-2.888,5.016c-0.028,0.048-0.03,0.1-0.05,0.148c-0.034,0.082-0.066,0.162-0.083,0.25c-0.016,0.08-0.018,0.159-0.017,0.239c0,0.083,0.001,0.16,0.017,0.24c0.017,0.089,0.049,0.167,0.084,0.251c0.021,0.049,0.021,0.102,0.049,0.148l2.888,5.012l-2.518,4.339h-6.52l-3.255,5.653h-5.776c-0.707,0-1.279,0.572-1.279,1.28c0,0.706,0.572,1.277,1.279,1.277h5.776l2.518,4.373l-2.885,4.977c-0.354,0.611-0.146,1.393,0.465,1.748s1.393,0.146,1.748-0.464l2.885-4.979h5.043l2.889,4.979c0.053,0.092,0.119,0.173,0.19,0.244c0.006,0.006,0.009,0.015,0.016,0.021c0.105,0.104,0.229,0.181,0.359,0.242c0.034,0.016,0.066,0.029,0.102,0.042c0.141,0.05,0.287,0.086,0.438,0.088c0.001,0,0.002,0,0.002,0h5.741l2.52,4.374l-2.518,4.34H39.98l-3.626,6.3c-0.028,0.047-0.03,0.098-0.05,0.147c-0.034,0.082-0.066,0.161-0.083,0.249c-0.016,0.081-0.018,0.16-0.017,0.24c0,0.082,0.001,0.16,0.017,0.24c0.017,0.088,0.049,0.168,0.084,0.25c0.021,0.05,0.022,0.102,0.049,0.148l2.888,5.013l-2.518,4.339h-5.043l-3.255-5.616h-7.989l-2.074,3.575c0.719,0.653,1.388,1.2,1.996,1.66l1.552-2.676h5.042l3.255,5.615h7.991l3.258-5.615h5.005l2.518,4.338l-2.888,5.019c-0.028,0.047-0.03,0.1-0.05,0.148c-0.034,0.082-0.066,0.161-0.083,0.249c-0.015,0.08-0.018,0.16-0.017,0.24c0,0.082,0.001,0.16,0.017,0.24c0.018,0.088,0.049,0.168,0.084,0.251c0.021,0.049,0.022,0.101,0.049,0.147l3.258,5.651c0.053,0.093,0.119,0.171,0.19,0.245c0.006,0.008,0.01,0.016,0.017,0.022c0.105,0.104,0.228,0.181,0.357,0.242c0.034,0.015,0.068,0.028,0.103,0.041c0.141,0.054,0.287,0.088,0.438,0.088c0.001,0,0.002,0,0.003,0h5.776l2.519,4.341l-2.89,5.013c-0.353,0.612-0.143,1.397,0.469,1.749c0.609,0.351,1.393,0.142,1.746-0.469l2.892-5.015h5.037l2.521,4.376l-2.89,5.015c-0.027,0.047-0.03,0.099-0.049,0.147c-0.036,0.082-0.068,0.162-0.085,0.253c-0.015,0.08-0.016,0.158-0.016,0.236c0,0.084,0.002,0.162,0.018,0.244c0.016,0.087,0.049,0.165,0.083,0.247c0.021,0.049,0.023,0.103,0.051,0.151l1.072,1.849c1.174,0.395,2.38,0.768,3.609,1.122l-2.097-3.615l2.52-4.372h5.039l2.516,4.372l-2.849,4.919c0.869,0.192,1.753,0.368,2.646,0.536l2.417-4.174H86.292z"/><path fill="#4D4D4D" d="M70.742,220.939l-3.257-5.65H60.97l-2.891-5.018c-0.353-0.612-1.135-0.821-1.747-0.47c-0.611,0.353-0.822,1.136-0.469,1.747l3.259,5.658c0.055,0.094,0.122,0.177,0.193,0.25c0.006,0.006,0.009,0.013,0.014,0.019c0.106,0.105,0.229,0.182,0.36,0.242c0.034,0.016,0.066,0.027,0.102,0.041c0.142,0.051,0.288,0.087,0.438,0.089c0.002,0,0.002,0,0.003,0h5.776l3.258,5.649h6.519l2.883,4.982c0.053,0.092,0.119,0.17,0.19,0.244c0.006,0.006,0.01,0.015,0.017,0.021c0.104,0.104,0.229,0.181,0.359,0.242c0.033,0.017,0.066,0.029,0.101,0.041c0.142,0.052,0.288,0.089,0.438,0.089c0.002,0,0.002,0,0.003,0h6.518c0,0,0,0,0.001,0c0.151,0,0.296-0.037,0.438-0.089c0.035-0.012,0.067-0.024,0.101-0.041c0.131-0.062,0.254-0.138,0.358-0.242c0.008-0.006,0.01-0.015,0.017-0.021c0.071-0.071,0.137-0.152,0.191-0.244l2.889-4.982h6.518l3.257-5.649h2.768l0.054-2.559h-4.299l-3.257,5.65h-5.04l-2.89-5.009c-0.353-0.612-1.136-0.823-1.746-0.47c-0.612,0.352-0.822,1.134-0.47,1.746l2.89,5.011l-2.519,4.341h-5.043l-2.513-4.341l2.884-5.011c0.028-0.047,0.03-0.101,0.051-0.148c0.034-0.083,0.065-0.162,0.083-0.249c0.016-0.081,0.018-0.159,0.017-0.239c0.001-0.082-0.001-0.16-0.017-0.242c-0.018-0.087-0.048-0.165-0.083-0.247c-0.021-0.049-0.023-0.103-0.049-0.149l-2.886-5.02l2.514-4.338h5.043l3.258,5.615h7.991l3.257-5.615h3.001l0.052-2.56h-4.528l-3.257,5.616h-5.043l-2.519-4.339l2.888-5.013c0.028-0.047,0.031-0.099,0.05-0.148c0.035-0.082,0.068-0.162,0.085-0.25c0.016-0.08,0.017-0.158,0.017-0.24c0.001-0.08-0.001-0.159-0.017-0.24c-0.017-0.088-0.05-0.167-0.084-0.249c-0.021-0.05-0.021-0.101-0.049-0.147l-3.258-5.66c-0.352-0.612-1.135-0.822-1.747-0.469c-0.611,0.352-0.822,1.135-0.47,1.746l2.891,5.02l-2.521,4.374h-5.04l-2.884-5.011c-0.351-0.612-1.133-0.822-1.746-0.473c-0.612,0.354-0.823,1.135-0.471,1.748l2.885,5.013l-2.882,4.978c-0.027,0.047-0.03,0.099-0.05,0.147c-0.035,0.084-0.067,0.163-0.085,0.251c-0.014,0.08-0.017,0.158-0.017,0.238c-0.001,0.082,0.001,0.161,0.017,0.243c0.017,0.087,0.048,0.166,0.082,0.247c0.022,0.05,0.024,0.104,0.051,0.15l2.886,5.021l-2.517,4.371H70.742z"/><path fill="#4D4D4D" d="M17.177,76.823l2.889,5.014c0.237,0.41,0.667,0.64,1.109,0.64c0.217,0,0.436-0.055,0.638-0.171c0.612-0.352,0.821-1.134,0.468-1.746l-3.626-6.295h-6.389l-0.94,3.967l0.812-1.408H17.177z"/><path fill="#4D4D4D" d="M95.428,178.203c0.203,0.116,0.421,0.171,0.637,0.171c0.441,0,0.873-0.23,1.109-0.642l2.889-5.013h3.587l0.043-2.558h-3.631l-2.519-4.371l2.518-4.339h3.778l0.042-2.56h-5.294l-3.627,6.254c-0.029,0.047-0.032,0.102-0.052,0.152c-0.034,0.081-0.067,0.159-0.083,0.248c-0.016,0.08-0.017,0.16-0.017,0.242c0,0.08,0,0.156,0.015,0.238c0.017,0.088,0.049,0.168,0.084,0.25c0.021,0.051,0.022,0.104,0.049,0.15l2.891,5.015l-2.891,5.015C94.606,177.069,94.816,177.851,95.428,178.203z"/><path fill="#4D4D4D" d="M96.807,155.799l3.257-5.656h3.965l0.042-2.559h-5.485l-3.257,5.656H88.81l-3.257,5.652h-5.779c-0.707,0-1.279,0.572-1.279,1.279s0.572,1.28,1.279,1.28h5.781l2.889,4.978c0.237,0.41,0.667,0.638,1.106,0.638c0.219,0,0.44-0.054,0.642-0.173c0.61-0.354,0.819-1.137,0.464-1.748l-2.888-4.977l2.521-4.371H96.807z"/><path fill="#4D4D4D" d="M98.016,245.579l-1.209-2.099H88.81l-1.348,2.339c1.604,0.119,3.24,0.191,4.906,0.221h2.816c0.762-0.012,1.518-0.014,2.292-0.045L98.016,245.579z"/><path fill="#4D4D4D" d="M8.142,102.459H5.582l-0.607,2.559h3.168c0.706,0,1.279-0.571,1.279-1.278S8.848,102.459,8.142,102.459z"/><path fill="#4D4D4D" d="M12.038,198.533c-0.116-0.067-0.24-0.095-0.364-0.122l0.96,0.898C12.55,198.993,12.344,198.71,12.038,198.533z"/><path fill="#4D4D4D" d="M12.041,187.261c-0.612-0.357-1.394-0.146-1.748,0.464l-2.544,4.388c0.426,0.967,0.862,1.888,1.304,2.765c0.002-0.002,0.004-0.005,0.006-0.007c0.071-0.073,0.137-0.153,0.19-0.245l3.257-5.616C12.86,188.397,12.652,187.614,12.041,187.261z"/><path fill="#4D4D4D" d="M8.142,138.868c0.706,0,1.279-0.573,1.279-1.28c0-0.706-0.573-1.278-1.279-1.278H2.367l-1.216-2.112c-0.218,2.636-0.383,5.186-0.497,7.648l1.714-2.978H8.142z"/><path fill="#4D4D4D" d="M60.873,238.038c-0.611-0.355-1.394-0.146-1.748,0.465l-0.075,0.129c0.765,0.342,1.541,0.68,2.337,1.009C61.636,239.056,61.437,238.367,60.873,238.038z"/><path fill="#4D4D4D" d="M98.047,24.764c0,0.706,0.572,1.28,1.279,1.28h4.901l-0.001-2.559h-4.9C98.619,23.485,98.047,24.058,98.047,24.764z"/><path fill="#4D4D4D" d="M75.365,7.349c-0.036,0.083-0.067,0.163-0.085,0.251c-0.014,0.08-0.017,0.156-0.017,0.238c-0.001,0.082,0.001,0.16,0.017,0.242c0.017,0.088,0.048,0.166,0.083,0.248c0.021,0.05,0.023,0.104,0.05,0.15l2.887,5.015l-2.518,4.375h-6.515l-3.258,5.617h-5.042l-2.891-4.979c-0.355-0.612-1.139-0.819-1.748-0.464c-0.611,0.354-0.819,1.136-0.464,1.748l2.888,4.976l-2.521,4.374h-5.035l-3.257-5.654h-1.46l0.306,3.121l2.564,4.449c0.055,0.095,0.121,0.177,0.193,0.251c0.004,0.005,0.008,0.013,0.013,0.019c0.105,0.104,0.229,0.18,0.36,0.241c0.033,0.016,0.066,0.028,0.102,0.042c0.141,0.052,0.287,0.086,0.438,0.088c0.001,0,0.002,0,0.003,0h5.776l2.891,4.979c0.053,0.091,0.118,0.171,0.189,0.243c0.006,0.006,0.01,0.015,0.017,0.021c0.105,0.106,0.229,0.183,0.359,0.243c0.033,0.016,0.065,0.028,0.101,0.041c0.141,0.052,0.288,0.088,0.438,0.088c0,0,0.001,0.001,0.002,0.001h5.776l2.521,4.377l-2.521,4.376h-6.512l-3.26,5.619h-6.516l-3.256,5.652H40.72c-0.707,0-1.279,0.574-1.279,1.28s0.572,1.278,1.279,1.278h6.48c0.001,0,0.001,0,0.003,0c0.15,0,0.296-0.037,0.437-0.089c0.036-0.013,0.069-0.024,0.103-0.041c0.13-0.062,0.254-0.138,0.358-0.243c0.006-0.004,0.009-0.012,0.015-0.018c0.072-0.073,0.139-0.155,0.193-0.249l2.889-5.013h5.035l2.891,5.013c0.027,0.048,0.073,0.076,0.104,0.119c0.055,0.07,0.106,0.138,0.173,0.196c0.063,0.055,0.13,0.095,0.202,0.137c0.07,0.04,0.138,0.078,0.215,0.105c0.084,0.028,0.169,0.041,0.258,0.051c0.054,0.008,0.101,0.031,0.156,0.031h5.776l3.257,5.656h6.52l2.514,4.342l-2.516,4.371h-6.518l-3.257,5.654H60.97l-3.26-5.654h-6.512l-2.519-4.371l2.517-4.342h5.039l2.891,4.98c0.053,0.093,0.118,0.171,0.189,0.244c0.006,0.007,0.01,0.016,0.017,0.021c0.105,0.105,0.229,0.182,0.359,0.242c0.033,0.016,0.065,0.029,0.101,0.041c0.141,0.053,0.288,0.088,0.438,0.088c0,0,0.001,0.002,0.002,0.002h6.516c0.706,0,1.279-0.572,1.279-1.279s-0.573-1.279-1.279-1.279h-5.779l-3.26-5.619h-7.986l-3.258,5.619h-5.005l-2.889-4.98c-0.354-0.611-1.138-0.818-1.748-0.467c-0.611,0.355-0.819,1.139-0.465,1.748l3.258,5.619c0.053,0.093,0.119,0.173,0.19,0.246c0.006,0.006,0.009,0.016,0.016,0.02c0.105,0.105,0.229,0.182,0.36,0.242c0.033,0.016,0.065,0.029,0.101,0.041c0.14,0.053,0.287,0.088,0.438,0.088c0.001,0,0.002,0.002,0.002,0.002h5.741l2.889,5.014c0.055,0.092,0.121,0.174,0.193,0.25c0.004,0.004,0.008,0.012,0.013,0.017c0.105,0.104,0.229,0.181,0.36,0.242c0.033,0.017,0.066,0.028,0.102,0.041c0.141,0.053,0.287,0.089,0.438,0.089c0.001,0,0.002,0,0.003,0h5.774l2.521,4.373l-2.888,4.977c-0.028,0.047-0.03,0.1-0.05,0.149c-0.035,0.082-0.068,0.161-0.085,0.249c-0.015,0.082-0.017,0.158-0.017,0.24s0,0.16,0.017,0.242c0.017,0.086,0.048,0.165,0.083,0.248c0.021,0.05,0.023,0.104,0.051,0.15l3.26,5.656c0.054,0.094,0.121,0.176,0.194,0.25c0.005,0.005,0.008,0.012,0.012,0.017c0.106,0.104,0.229,0.182,0.361,0.242c0.033,0.017,0.065,0.028,0.101,0.041c0.141,0.052,0.288,0.089,0.438,0.089c0,0,0.001,0,0.002,0h6.516c0.706,0,1.279-0.572,1.279-1.278s-0.573-1.28-1.279-1.28H60.97l-2.521-4.372l2.519-4.34h5.779c0,0,0.001,0,0.002,0c0.151,0,0.297-0.037,0.438-0.089c0.035-0.012,0.068-0.025,0.102-0.041c0.13-0.062,0.254-0.137,0.359-0.242c0.005-0.006,0.008-0.012,0.013-0.019c0.073-0.073,0.139-0.155,0.193-0.249l2.889-5.014h5.039l2.884,5.012c0.352,0.613,1.136,0.824,1.746,0.471c0.612-0.352,0.823-1.134,0.47-1.746l-2.886-5.015l2.886-5.017c0.028-0.047,0.03-0.1,0.051-0.148c0.034-0.082,0.066-0.162,0.083-0.25c0.016-0.08,0.018-0.158,0.017-0.24c0-0.082-0.001-0.16-0.017-0.24c-0.018-0.089-0.049-0.168-0.085-0.251c-0.021-0.05-0.022-0.101-0.05-0.147l-3.622-6.258h-6.516l-3.258-5.656H60.97l-2.521-4.371l2.519-4.341h5.779c0,0,0.001-0.001,0.002-0.001c0.151-0.002,0.297-0.036,0.438-0.088c0.034-0.014,0.067-0.026,0.101-0.042c0.13-0.061,0.254-0.139,0.36-0.243c0.004-0.004,0.006-0.01,0.01-0.015c0.074-0.073,0.141-0.157,0.196-0.253l2.888-5.014h5.039l2.516,4.373l-2.513,4.342h-5.781c-0.707,0-1.279,0.572-1.279,1.279s0.572,1.279,1.279,1.279h5.778l2.884,5.011c0.054,0.096,0.121,0.179,0.194,0.253c0.004,0.005,0.008,0.012,0.013,0.016c0.105,0.105,0.229,0.182,0.36,0.243c0.033,0.017,0.066,0.028,0.101,0.041c0.141,0.052,0.287,0.089,0.438,0.089c0.002,0,0.002,0,0.003,0h5.779l2.52,4.375l-2.887,4.979c-0.028,0.049-0.031,0.102-0.051,0.151c-0.035,0.082-0.067,0.16-0.084,0.249c-0.016,0.08-0.017,0.16-0.017,0.241s0,0.158,0.017,0.239c0.017,0.088,0.049,0.168,0.083,0.25c0.022,0.05,0.024,0.104,0.05,0.15l2.891,5.015l-2.891,5.015c-0.026,0.047-0.028,0.099-0.049,0.148c-0.035,0.084-0.068,0.163-0.084,0.252c-0.017,0.08-0.017,0.158-0.017,0.238c0,0.082,0.001,0.16,0.017,0.242c0.018,0.088,0.049,0.166,0.084,0.247c0.021,0.05,0.022,0.104,0.051,0.152l2.885,4.977l-2.888,5.014c-0.352,0.612-0.142,1.395,0.47,1.746c0.612,0.351,1.395,0.143,1.747-0.47l2.89-5.014h5.039l2.52,4.376l-2.891,5.013c-0.027,0.047-0.029,0.101-0.049,0.15c-0.035,0.083-0.068,0.162-0.084,0.25c-0.015,0.08-0.015,0.158-0.015,0.238c0,0.082,0.001,0.162,0.017,0.242c0.016,0.089,0.049,0.167,0.084,0.249c0.021,0.05,0.023,0.103,0.051,0.149l2.886,4.98l-2.889,5.013c-0.027,0.047-0.029,0.1-0.049,0.149c-0.035,0.082-0.068,0.162-0.084,0.25c-0.015,0.081-0.015,0.159-0.015,0.239c0,0.082,0.001,0.16,0.017,0.242c0.016,0.089,0.049,0.167,0.083,0.247c0.021,0.051,0.023,0.104,0.052,0.152l3.257,5.615c0.054,0.094,0.12,0.176,0.193,0.25c0.005,0.004,0.007,0.011,0.013,0.015c0.104,0.106,0.229,0.182,0.36,0.243c0.033,0.017,0.065,0.027,0.099,0.041c0.143,0.052,0.288,0.088,0.439,0.089c0,0,0.002,0,0.003,0h4.919v-2.558h-4.183l-2.518-4.34l2.887-5.012c0.028-0.047,0.03-0.101,0.051-0.15c0.034-0.083,0.067-0.162,0.084-0.25c0.014-0.082,0.015-0.158,0.015-0.24c0-0.08-0.001-0.16-0.015-0.24c-0.018-0.089-0.05-0.167-0.085-0.249c-0.021-0.05-0.022-0.103-0.05-0.149l-2.887-4.98l2.519-4.371h4.178l-0.001-2.559h-4.176l-3.257-5.653h-6.52l-2.519-4.34l2.888-5.011c0.028-0.048,0.031-0.1,0.05-0.148c0.035-0.084,0.068-0.162,0.085-0.252c0.016-0.081,0.017-0.159,0.017-0.239c0-0.082-0.001-0.16-0.017-0.24c-0.017-0.089-0.05-0.169-0.085-0.251c-0.02-0.049-0.022-0.102-0.05-0.147l-2.888-5.013l2.888-4.98c0.028-0.047,0.031-0.1,0.05-0.15c0.035-0.081,0.068-0.16,0.085-0.246c0.016-0.082,0.017-0.16,0.017-0.242c0.001-0.082-0.001-0.16-0.017-0.24c-0.017-0.087-0.049-0.166-0.082-0.248c-0.021-0.051-0.023-0.104-0.051-0.152l-3.627-6.297h-6.518l-2.516-4.371l2.882-4.98c0.028-0.047,0.03-0.1,0.051-0.149c0.035-0.082,0.067-0.16,0.083-0.247c0.017-0.082,0.018-0.16,0.018-0.242s-0.001-0.158-0.017-0.24c-0.017-0.088-0.049-0.168-0.083-0.25c-0.021-0.05-0.023-0.102-0.051-0.148l-3.621-6.297h-6.519l-3.258-5.657h-6.517l-2.519-4.339l2.521-4.371h5.037l2.889,5.012c0.237,0.411,0.667,0.641,1.109,0.641c0.217,0,0.437-0.055,0.638-0.171c0.612-0.353,0.822-1.134,0.469-1.747l-2.888-5.013l2.517-4.339h5.781c0.001,0,0.001-0.001,0.003-0.001c0.151-0.001,0.297-0.036,0.438-0.087c0.035-0.015,0.068-0.027,0.101-0.043c0.131-0.061,0.255-0.139,0.36-0.243c0.004-0.004,0.008-0.011,0.013-0.017c0.073-0.074,0.14-0.156,0.194-0.252l3.253-5.652c0.027-0.047,0.029-0.1,0.049-0.147c0.035-0.083,0.067-0.162,0.084-0.251c0.016-0.08,0.018-0.158,0.017-0.24c0.001-0.08-0.001-0.158-0.017-0.24c-0.018-0.086-0.049-0.166-0.084-0.248c-0.021-0.05-0.022-0.102-0.049-0.148l-2.884-5.015l2.514-4.339h5.043l3.258,5.616h6.515l2.888,5.013c0.054,0.095,0.121,0.178,0.193,0.251c0.005,0.005,0.009,0.013,0.015,0.019c0.104,0.104,0.228,0.18,0.359,0.242c0.033,0.015,0.066,0.027,0.101,0.041c0.142,0.052,0.287,0.086,0.438,0.088c0,0,0.002,0.001,0.003,0.001h4.898v-2.558h-4.161l-3.256-5.653h-6.52l-2.425-4.18c-3.402,0.26-6.979,0.646-10.365,1.221l-2.082,3.596C75.387,7.246,75.385,7.299,75.365,7.349z"/><path fill="#4D4D4D" d="M98.216,2.862c0.237,0.411,0.667,0.641,1.109,0.641c0.218,0,0.437-0.056,0.638-0.171c0.52-0.299,0.725-0.904,0.567-1.456c-0.842,0.005-1.8,0.018-2.858,0.04L98.216,2.862z"/><path fill="#4D4D4D" d="M38.199,54.243l3.258-5.618H47.2c0.001,0,0.001-0.001,0.003-0.001c0.151-0.002,0.297-0.036,0.438-0.088c0.035-0.014,0.068-0.026,0.101-0.042c0.131-0.061,0.255-0.139,0.36-0.243c0.004-0.004,0.007-0.01,0.011-0.015c0.074-0.073,0.142-0.157,0.196-0.253l2.889-5.014h5.773c0.706,0,1.279-0.574,1.279-1.28c0-0.707-0.573-1.278-1.279-1.278h-5.773l-3.257-5.657h-6.482l-3.258-5.614h-0.103c-1.059,0.85-2.047,1.705-2.969,2.557h1.597l2.889,4.979c0.054,0.093,0.12,0.175,0.193,0.249c0.005,0.004,0.007,0.011,0.013,0.015c0.105,0.104,0.229,0.183,0.36,0.243c0.033,0.016,0.065,0.028,0.1,0.041c0.141,0.052,0.288,0.088,0.438,0.088c0.001,0,0.002,0.001,0.002,0.001h5.741l2.521,4.377l-2.521,4.376h-6.478l-3.258,5.619h-6.52l-3.255,5.652h-5.037l-1.156-2.006l-1.354,2.775l0.294,0.511l-2.89,5.017c-0.352,0.612-0.142,1.395,0.471,1.748c0.201,0.115,0.42,0.17,0.637,0.17c0.443,0,0.873-0.229,1.11-0.641l2.889-5.016h5.036l2.885,5.016c0.354,0.613,1.134,0.822,1.747,0.471c0.612-0.354,0.823-1.135,0.471-1.748l-2.889-5.017l2.519-4.374H38.199z"/><path fill="#4D4D4D" d="M68.897,8.482c0.237,0.409,0.667,0.637,1.107,0.637c0.218,0,0.438-0.055,0.64-0.172c0.612-0.355,0.82-1.137,0.465-1.748l-1.075-1.856c-0.863,0.275-1.68,0.571-2.442,0.892L68.897,8.482z"/><path fill="#4D4D4D" d="M37.463,42.97c0.706,0,1.279-0.574,1.279-1.28c0-0.707-0.573-1.278-1.279-1.278h-5.778l-1.806-3.138c-0.624,0.764-1.187,1.495-1.692,2.188l1.282,2.228l-2.52,4.376h-1.802l2.036,2.56h0.506c0,0,0.001-0.001,0.002-0.001c0.151-0.002,0.297-0.036,0.438-0.088c0.034-0.014,0.067-0.026,0.101-0.042c0.13-0.061,0.255-0.139,0.361-0.243c0.004-0.004,0.006-0.01,0.01-0.015c0.074-0.073,0.141-0.157,0.196-0.253l2.886-5.014H37.463z"/><path fill="#4D4D4D" d="M94.91,75.054c-0.035,0.082-0.068,0.162-0.084,0.251c-0.016,0.08-0.017,0.158-0.017,0.24c0,0.08,0.001,0.158,0.017,0.239c0.016,0.09,0.049,0.168,0.084,0.252c0.021,0.049,0.022,0.101,0.048,0.148l3.258,5.652c0.054,0.094,0.121,0.176,0.193,0.25c0.005,0.006,0.009,0.012,0.015,0.018c0.104,0.105,0.228,0.181,0.359,0.242c0.033,0.016,0.066,0.029,0.101,0.041c0.142,0.052,0.287,0.089,0.438,0.089c0,0,0.002,0,0.003,0h4.913l-0.001-2.558h-4.174l-2.52-4.374l2.888-5.015c0.028-0.047,0.03-0.101,0.051-0.15c0.034-0.082,0.067-0.162,0.084-0.25c0.014-0.081,0.015-0.158,0.015-0.239s-0.001-0.161-0.015-0.241c-0.018-0.089-0.05-0.167-0.085-0.249c-0.021-0.05-0.022-0.103-0.05-0.151l-2.887-4.979l2.52-4.375h4.169v-2.559h-4.17l-3.256-5.652h-6.52l-2.519-4.342l2.89-5.015c0.028-0.048,0.03-0.102,0.051-0.151c0.033-0.08,0.065-0.158,0.082-0.247c0.016-0.08,0.018-0.158,0.017-0.24c0.001-0.083-0.001-0.16-0.017-0.24c-0.017-0.087-0.049-0.167-0.082-0.247c-0.021-0.049-0.023-0.104-0.051-0.152l-3.627-6.296h-6.521l-2.513-4.339l2.516-4.371h5.04l3.257,5.652h6.521l2.516,4.34l-2.888,5.014c-0.027,0.049-0.03,0.104-0.049,0.152c-0.035,0.08-0.067,0.16-0.083,0.247c-0.016,0.08-0.017,0.157-0.017,0.24c0,0.082,0.001,0.16,0.017,0.24c0.016,0.089,0.048,0.167,0.083,0.247c0.02,0.05,0.022,0.104,0.049,0.151l3.258,5.655c0.237,0.411,0.667,0.642,1.109,0.642c0.218,0,0.437-0.056,0.637-0.171c0.612-0.354,0.823-1.135,0.47-1.747l-2.888-5.018l2.52-4.377h4.165l-0.001-2.559h-4.166l-3.257-5.614H90.29l-2.521-4.374l2.519-4.339h5.78c0.707,0,1.28-0.573,1.28-1.279c0-0.707-0.573-1.279-1.28-1.279h-5.779l-2.89-5.014c-0.353-0.61-1.132-0.822-1.746-0.469c-0.612,0.353-0.822,1.135-0.47,1.746l2.888,5.014l-2.516,4.34h-6.521l-3.622,6.295c-0.027,0.047-0.029,0.101-0.05,0.15c-0.035,0.082-0.066,0.16-0.083,0.248c-0.015,0.082-0.017,0.16-0.017,0.242c0,0.08,0.002,0.158,0.017,0.238c0.019,0.089,0.049,0.169,0.085,0.251c0.021,0.048,0.022,0.101,0.05,0.147l3.252,5.617c0.053,0.092,0.119,0.17,0.189,0.243c0.007,0.007,0.011,0.016,0.019,0.024c0.104,0.104,0.228,0.18,0.358,0.24c0.033,0.016,0.066,0.028,0.101,0.041c0.142,0.052,0.288,0.088,0.438,0.088c0.001,0,0.001,0.001,0.002,0.001h5.779l2.521,4.377l-2.891,5.018c-0.027,0.048-0.029,0.102-0.05,0.151c-0.035,0.082-0.066,0.161-0.083,0.248c-0.017,0.08-0.018,0.158-0.017,0.24c0,0.082,0.001,0.16,0.017,0.242c0.018,0.087,0.049,0.165,0.084,0.246c0.021,0.051,0.022,0.104,0.051,0.152l3.628,6.256h6.515l2.52,4.374l-2.891,5.017c-0.027,0.049-0.03,0.102-0.049,0.152c-0.035,0.082-0.068,0.161-0.084,0.248c-0.015,0.08-0.015,0.158-0.015,0.24s0.001,0.16,0.017,0.242c0.016,0.086,0.049,0.165,0.083,0.246c0.021,0.051,0.023,0.104,0.052,0.15l2.886,4.98l-2.889,5.013C94.932,74.952,94.931,75.005,94.91,75.054z"/><path fill="#4D4D4D" d="M48.889,18.987l0.461,0.799c0.236,0.41,0.667,0.641,1.109,0.641c0.217,0,0.436-0.056,0.637-0.172c0.612-0.352,0.823-1.134,0.469-1.747l-0.742-1.286C50.142,17.792,49.491,18.382,48.889,18.987z"/><path fill="#4D4D4D" d="M59.123,14.132c0.027,0.05,0.073,0.076,0.104,0.119c0.055,0.072,0.106,0.139,0.174,0.197c0.063,0.055,0.129,0.095,0.201,0.136c0.07,0.042,0.138,0.078,0.216,0.104c0.083,0.029,0.167,0.041,0.256,0.053c0.053,0.008,0.102,0.032,0.157,0.032h6.516c0.706,0,1.279-0.573,1.279-1.28c0-0.705-0.573-1.277-1.279-1.277h-0.071l-0.107,1.159l-0.718-1.159H60.97l-0.691-1.199c-0.688,0.369-1.44,0.787-2.233,1.248L59.123,14.132z"/></g><linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="158.438" y1="244.8975" x2="158.438" y2="2.5181"><stop offset="0" style="stop-color:#00A8DE"/><stop offset="0.2" style="stop-color:#333391"/><stop offset="0.4" style="stop-color:#E91388"/><stop offset="0.6" style="stop-color:#EB2D2E"/><stop offset="0.8" style="stop-color:#FDE92B"/><stop offset="1" style="stop-color:#009E54"/></linearGradient><path fill="url(#SVGID_1_)" d="M210.294,141.734c0-1.422-0.078-2.79-0.217-4.092c0.041-0.007,0.083,0.004,0.126-0.009c0,0,2.284-2.997-2.28-9.321c0.396-1.428,0.628-3.096,0.628-4.886c0-3.547-0.896-6.633-2.224-8.26c0.257-1.047,0.447-2.188,0.563-3.394c0.507-0.731,1.019-1.538,1.532-2.431c0,0,0.594-7.521-2.176-7.521c0,0-0.085,0.026-0.203,0.061c-0.58-1.915-1.386-3.442-2.33-4.37c-0.019-0.141-0.041-0.242-0.041-0.242c1.387-4.748-0.592-14.047-0.592-14.047c-0.441-9.108-5.022-12.539-7.354-13.706c-0.484-1.612-1.116-2.991-1.854-4.05c0.42,0.039,0.699,0.146,0.699,0.146l-2.77-10.685c-1.481-2.317-2.798-3.57-3.945-4.158c-0.5-2.155-1.271-4.101-2.261-5.706c-5.066-12.057-12.286-17.107-15.915-18.982c-1.67-1.135-3.585-1.931-5.644-2.316c0.292-2.173-0.867-5.951-8.285-11.391c-0.269-0.278-0.551-0.541-0.838-0.799c-0.061-0.066-0.141-0.143-0.243-0.221c-2.604-2.21-5.971-3.551-9.653-3.551c-0.607,0-1.203,0.048-1.792,0.118c0.87-0.924-0.891-1.074-0.891-1.074c-6.728-8.707-19.785-5.143-19.785-5.143c-1.979-3.564-13.456,1.58-13.456,1.58c-2.375,2.376-0.791,5.938-0.791,5.938c0,2.571-1.584,6.726-1.584,6.726c4.157,0.991,1.584,11.479,1.584,11.479c0.099,1.189,1.69,4.123,3.254,6.75v5.409l-0.681,0.106c-5.146,0.989-2.968,16.62-2.968,16.62c-2.968,6.331-1.387,19.588-1.387,19.588c1.316,2.632,3.418,4.167,5.035,5.014v3.833l-2.067,2.629c-0.367,1.826,0.582,3.916,2.067,5.932v4.463c-0.184-0.19-0.286-0.303-0.286-0.303c-5.936,3.759-2.771,12.859-2.771,12.859c-0.448,2.587,1.158,4.324,3.057,5.457v3.71c-2.125,1.179-2.859,2.31-2.859,2.31c-3.362,8.903,2.573,16.423,2.573,16.423c0.093-0.012,0.189-0.035,0.286-0.051v5.865c-1.617,3.174-1.848,7.434,1.742,12.854v1.803c-2.603-0.348-6.35,0.202-5.761,6.807c0,0-0.473,14.14,1.703,15.523c0,0,0.898,1.917,4.058,0.629v2.404c-2.114,1.897-3.718,4.423-4.007,7.787c0,0,1.019,4.37,4.007,7.625v3.961c-1.865-0.373-3.018-0.708-3.018-0.708l-4.155,7.719c0,3.692,4.3,6.675,7.173,8.259v1.076l-3.611-0.232l0.199,6.33l3.412,1.865v0.918l-3.611,1.571c-3.364,1.385,0.99,14.048,0.99,14.048l11.872,0.197c0.454-0.261,1.054-0.711,1.655-1.197c2.2,1.275,5.481,2.087,9.151,2.087c3.936,0,7.417-0.935,9.602-2.371c13.047,0.257,26.682-18.899,26.682-18.899c0.027-0.117,0.032-0.214,0.056-0.327c3.552-0.181,6.54-3.874,7.652-8.983c2.502-0.106,7.463-0.692,10.891-3.55c0,0,16.797-17.754,16.093-25.135c0,0,0.925-17.403,3.499-20.175c0,0,4.3-12.243,2.256-20.197C210.218,144.456,210.294,143.12,210.294,141.734z M156.407,232.869c0.144-0.069,0.287-0.142,0.43-0.218c-0.138,0.148-0.273,0.296-0.41,0.438C156.419,233.018,156.416,232.943,156.407,232.869z"/></g></svg></div>').appendTo(this.container);

	//if percentage is on
	//if (this.parent.options.percentage == true) {
		//this.percentageContainer = $("<div class='preloader_percent' id='qLpercentage'>").html("<div class='loader_text'><span >0</span></div></div>").appendTo(this.container);
	//}

	//if no images... destroy
	if (!this.parent.preloadContainer.toPreload.length || this.parent.alreadyLoaded == true) {
		this.parent.destroyContainers();
	}
};

OverlayLoader.prototype.updatePercentage = function (percentage) {
	/*this.loadbar.stop().animate({
		width: percentage + "%",
		minWidth: percentage + "%"
	}, 200);*/

	//update textual percentage
	if (this.parent.options.percentage == true) {
		$('.loader_text span').text(Math.ceil(percentage))
	}
};
function PreloadContainer(parent) {
    this.toPreload = [];
    this.parent = parent;
    this.container;
};

PreloadContainer.prototype.create = function () {
    /*this.container = $("<div></div>").appendTo("body").css({
        display: "none",
        width: 0,
        height: 0,
        overflow: "hidden"
    });
*/
    //process the image queue
    this.processQueue();
};

PreloadContainer.prototype.processQueue = function () {
    //add background images for loading
    for (var i = 0; this.toPreload.length > i; i++) {
		if (!this.parent.destroyed) {
			this.preloadImage(this.toPreload[i]);
		}
    }
};

PreloadContainer.prototype.addImage = function (src) {
    
    this.toPreload.push(src);
};

PreloadContainer.prototype.preloadImage = function (url) {
    
    var image = new PreloadImage();
    image.addToPreloader(this, url);
    image.bindLoadEvent();
};
function PreloadImage(parent) {
    this.element;
    this.parent = parent;
};

PreloadImage.prototype.addToPreloader = function (preloader, url) {
	
    this.element = $("<img />").attr("src", url);
    this.element.appendTo(preloader.container);
    this.parent = preloader.parent;
};

PreloadImage.prototype.bindLoadEvent = function () {
    this.parent.imageCounter++;

    //binding
    this.element[0].ref = this;

    new imagesLoaded(this.element, function (e) {
        e.elements[0].ref.completeLoading();
    });
};

PreloadImage.prototype.completeLoading = function () {
    this.parent.imageDone++;

    var percentage = (this.parent.imageDone / this.parent.imageCounter) * 100;

    

	//update the percentage of the loader
	this.parent.overlayLoader.updatePercentage(percentage);

	//all images done!
    if (this.parent.imageDone == this.parent.imageCounter || percentage >= 100) {
		this.parent.endLoader();
    }
};
function QueryLoader2(element, options) {
	this.element = element;
    this.$element = $(element);
	this.options = options;
    this.foundUrls = [];
    this.destroyed = false;
    this.imageCounter = 0;
    this.imageDone = 0;
	this.alreadyLoaded = false;

	//create objects
    this.preloadContainer = new PreloadContainer(this);
	this.overlayLoader = new OverlayLoader(this);

	//The default options
    this.defaultOptions = {
        onComplete: function() {},
		onLoadComplete: function() {},
        backgroundColor: "#000",
        barColor: "#fff",
        overlayId: 'qLoverlay',
        barHeight: 1,
        percentage: false,
        deepSearch: true,
        completeAnimation: "fade",
        minimumTime: 500
    };

	//run the init
	this.init();
};

QueryLoader2.prototype.init = function() {
	

	
	this.options = $.extend({}, this.defaultOptions, this.options);

    
    var images = this.findImageInElement(this.element);
    if (this.options.deepSearch == true) {
        
        var elements = this.$element.find("*:not(script)");
        for (var i = 0; i < elements.length; i++) {
            this.findImageInElement(elements[i]);
        }
    }

    //create containers
    this.preloadContainer.create();
	this.overlayLoader.createOverlay();
};

QueryLoader2.prototype.findImageInElement = function (element) {
    var url = "";
    var obj = $(element);
    var type = "normal";

    if (obj.css("background-image") != "none") {
        //if object has background image
        url = obj.css("background-image");
        type = "background";
    } else if (typeof(obj.attr("src")) != "undefined" && element.nodeName.toLowerCase() == "img") {
        //if is img and has src
        url = obj.attr("src");
    }

    //skip if gradient
    if (!this.hasGradient(url)) {
        //remove unwanted chars
        url = this.stripUrl(url);

        //split urls
        var urls = url.split(", ");

        for (var i = 0; i < urls.length; i++) {
            if (this.validUrl(urls[i]) && this.urlIsNew(urls[i])) {
                
                var extra = "";

                if (this.isIE() || this.isOpera()){
                    //filthy always no cache for IE, sorry peeps!
                    extra = "?rand=" + Math.random();

                    //add to preloader
                    this.preloadContainer.addImage(urls[i] + extra);
                } else {
                    if (type == "background") {
                        //add to preloader
                        this.preloadContainer.addImage(urls[i] + extra);
                    } else {
                        var image = new PreloadImage(this);
                        image.element = obj;
                        image.bindLoadEvent();
                    }
                }

                //add image to found list
                this.foundUrls.push(urls[i]);
            }
        }
    }
};

QueryLoader2.prototype.hasGradient = function (url) {
    if (url.indexOf("gradient") == -1) {
        return false;
    } else {
        return true;
    }
};

QueryLoader2.prototype.stripUrl = function (url) {
    url = url.replace(/url\(\"/g, "");
    url = url.replace(/url\(/g, "");
    url = url.replace(/\"\)/g, "");
    url = url.replace(/\)/g, "");

    return url;
};

QueryLoader2.prototype.isIE = function () {
    return navigator.userAgent.match(/msie/i);
};

QueryLoader2.prototype.isOpera = function () {
    return navigator.userAgent.match(/Opera/i);
};

QueryLoader2.prototype.validUrl = function (url) {
    if (url.length > 0 && !url.match(/^(data:)/i)) {
        return true;
    } else {
        return false;
    }
};

QueryLoader2.prototype.urlIsNew = function (url) {
    if (this.foundUrls.indexOf(url) == -1) {
        return true;
    } else {
        return false;
    }
};

QueryLoader2.prototype.destroyContainers = function () {
	this.destroyed = true;
	this.preloadContainer.container.remove();
	this.overlayLoader.container.remove();
};

QueryLoader2.prototype.endLoader = function () {
	

	this.destroyed = true;
	this.onLoadComplete();
};

QueryLoader2.prototype.onLoadComplete = function() {
	//fire the event before end animation
	this.options.onLoadComplete();

	if (this.options.completeAnimation == "grow") {
		var animationTime = this.options.minimumTime;

		this.overlayLoader.loadbar[0].parent = this; //put object in DOM element
		//this.overlayLoader.loadbar.stop().animate({
			//"width": "100%"
		//}, animationTime, function () {
			//$(this).animate({
			//	top: "0%",
			//	width: "100%",
			//	height: "100%"
			//}, 500, function () {
				//this.parent.overlayLoader.container[0].parent = this.parent; //once again...
				this.parent.overlayLoader.container.fadeOut(500, function () {
					this.parent.destroyContainers();
					this.parent.options.onComplete();
				});
			//});
		//});
	} else {
        var animationTime = this.options.minimumTime;

		//this.overlayLoader.container[0].parent = this;
		$('.preload_container').addClass('slideaway').delay(animationTime).fadeOut(500, function () {
			//console.log(this);
			//this.fadeIn(500, function () {
				//this.addclas('slideaway');
			   //this.destroyContainers();
			   //this.options.onComplete();
			//});
		});
	}
};
//HERE COMES THE IE SHITSTORM
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (elt /*, from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			? Math.ceil(from)
			: Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++) {
			if (from in this &&
				this[from] === elt)
				return from;
		}
		return -1;
	};
}
//function binder
$.fn.queryLoader2 = function(options){
    return this.each(function(){
        (new QueryLoader2(this, options));
    });
};
})(jQuery);
