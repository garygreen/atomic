var atomic = (function () {
  'use strict';

  function isUndefined (value) {
    return value === undefined
  }

  function isNull (value) {
    return value === null
  }

  function isObject (value) {
    return value === Object(value)
  }

  function isArray (value) {
    return Array.isArray(value)
  }

  function isDate (value) {
    return value instanceof Date
  }

  function isBlob (value) {
    return value &&
      typeof value.size === 'number' &&
      typeof value.type === 'string' &&
      typeof value.slice === 'function'
  }

  function isFile (value) {
    return isBlob(value) &&
      (typeof value.lastModifiedDate === 'object' || typeof value.lastModified === 'number') &&
      typeof value.name === 'string'
  }

  function isFormData (value) {
    return value instanceof FormData
  }

  function objectToFormData (obj, cfg, fd, pre) {
    if (isFormData(cfg)) {
      pre = fd;
      fd = cfg;
      cfg = null;
    }

    cfg = cfg || {};
    cfg.indices = cfg.indices || false;
    fd = fd || new FormData();

    if (isUndefined(obj)) {
      return fd
    } else if (isNull(obj)) {
      fd.append(pre, '');
    } else if (isArray(obj)) {
      if (!obj.length) {
        var key = pre + '[]';

        fd.append(key, '');
      } else {
        obj.forEach(function (value, index) {
          var key = pre + '[' + (cfg.indices ? index : '') + ']';

          objectToFormData(value, cfg, fd, key);
        });
      }
    } else if (isDate(obj)) {
      fd.append(pre, obj.toISOString());
    } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
      Object.keys(obj).forEach(function (prop) {
        var value = obj[prop];

        if (isArray(value)) {
          while (prop.length > 2 && prop.lastIndexOf('[]') === prop.length - 2) {
            prop = prop.substring(0, prop.length - 2);
          }
        }

        var key = pre ? (pre + '[' + prop + ']') : prop;

        objectToFormData(value, cfg, fd, key);
      });
    } else {
      fd.append(pre, obj);
    }

    return fd
  }

  /**
   * Instatiate Atomic
   * @param {String} url      The request URL
   * @param {Object} options  A set of options for the request [optional]
   */
  function Atomic(url, options) {

  	// Check browser support
  	if (!supports()) throw 'Atomic: This browser does not support the methods used in this plugin.';

  	// Merge options into defaults
  	settings = extend(Atomic.defaults, options || {});

  	// Make request
  	return makeRequest(url);

  }
  Atomic.defaults = {
  	method: 'GET',
  	username: null,
  	password: null,
  	data: {},
  	headers: {
  		'Content-type': 'application/x-www-form-urlencoded'
  	},
  	responseType: 'text',
  	timeout: null,
  	withCredentials: false
  };

  Atomic.get = function(url, data, settings) {
  	return new Atomic(url, extend({ data: data }, settings));
  };

  Atomic.post = function(url, data, settings) {
  	return new Atomic(url, extend({ data: data, method: 'POST' }, settings));
  };

  var settings;

  /**
   * Feature test
   * @return {Boolean} If true, required methods and APIs are supported
   */
  var supports = function () {
  	return 'XMLHttpRequest' in window && 'JSON' in window && 'Promise' in window;
  };

  /**
   * Merge two or more objects together.
   * @param   {Object}   objects  The objects to merge together
   * @returns {Object}            Merged values of defaults and options
   */
  var extend = function () {

  	// Variables
  	var extended = {};

  	// Merge the object into the extended object
  	var merge = function (obj) {
  		for (var prop in obj) {
  			if (obj.hasOwnProperty(prop)) {
  				if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
  					extended[prop] = extend(extended[prop], obj[prop]);
  				} else {
  					extended[prop] = obj[prop];
  				}
  			}
  		}
  	};

  	// Loop through each object and conduct a merge
  	for (var i = 0; i < arguments.length; i++) {
  		var obj = arguments[i];
  		merge(obj);
  	}

  	return extended;

  };

  /**
   * Parse text response into JSON
   * @private
   * @param  {String} req The response
   * @return {Array}      A JSON Object of the responseText, plus the orginal response
   */
  var parse = function (req) {
  	var result;
  	if (settings.responseType !== 'text' && settings.responseType !== '') {
  		return {data: req.response, xhr: req};
  	}
  	try {
  		result = JSON.parse(req.responseText);
  	} catch (e) {
  		result = req.responseText;
  	}
  	return {data: result, xhr: req};
  };

  /**
   * Convert an object into a query string
   * @link   https://blog.garstasio.com/you-dont-need-jquery/ajax/
   * @param  {Object|Array|String} obj The object
   * @return {String}                  The query string
   */
  var param = function (obj) {

  	// If the content-type is set to JSON, stringify the JSON object
  	if (/application\/json/i.test(settings.headers['Content-type']) || Object.prototype.toString.call(obj) === '[object Array]') return JSON.stringify(obj);

  	return objectToFormData(obj, {
  		indices: true
  	});

  };

  /**
   * Make an XHR request, returned as a Promise
   * @param  {String} url The request URL
   * @return {Promise}    The XHR request Promise
   */
  var makeRequest = function (url) {

  	// Create the XHR request
  	var request = new XMLHttpRequest();

  	// Setup the Promise
  	var xhrPromise = new Promise(function (resolve, reject) {

  		// Setup our listener to process compeleted requests
  		request.onreadystatechange = function () {

  			// Only run if the request is complete
  			if (request.readyState !== 4) return;

  			// Process the response
  			if (request.status >= 200 && request.status < 300) {
  				// If successful
  				resolve(parse(request));
  			} else {
  				// If failed
  				reject({
  					status: request.status,
  					statusText: request.statusText
  				});
  			}

  		};

  		// Setup our HTTP request
  		request.open(settings.method, url, true, settings.username, settings.password);
  		request.responseType = settings.responseType;

  		// Add headers
  		for (var header in settings.headers) {
  			if (settings.headers.hasOwnProperty(header)) {
  				request.setRequestHeader(header, settings.headers[header]);
  			}
  		}

  		// Set timeout
  		if (settings.timeout) {
  			request.timeout = settings.timeout;
  			request.ontimeout = function (e) {
  				reject({
  					status: 408,
  					statusText: 'Request timeout'
  				});
  			};
  		}

  		// Add withCredentials
  		if (settings.withCredentials) {
  			request.withCredentials = true;
  		}

  		// Send the request
  		request.send(param(settings.data));

  	});

  	// Cancel the XHR request
  	xhrPromise.cancel = function () {
  		request.abort();
  	};

  	// Return the request as a Promise
  	return xhrPromise;

  };

  return Atomic;

}());
