'use strict';

import fd from './fd';

function Atomic(url, options) {
	settings = extend(Atomic.defaults, options || {});

	return makeRequest(url);
};

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
}

Atomic.post = function(url, data, settings) {
	return new Atomic(url, extend({ data: data, method: 'POST' }, settings));
}

var settings;

var extend = function () {

	var extended = {};

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

	for (var i = 0; i < arguments.length; i++) {
		var obj = arguments[i];
		merge(obj);
	}

	return extended;

};

var newResponse = function (req) {
	var headers = normalizeHeaders(req);

	var response = {
		status: req.status,
		headers: headers,
		data: responseIsJson(req, headers) ? decodeJson(req) : req.responseText,
		request: req
	};

	return response;
};

var newTimeoutResponse = function(req) {
	return {
		status: 408,
		headers: {},
		data: '',
		request: req
	};
}

var decodeJson = function(req) {

	if (req.responseType == 'json') {
		return req.response;
	}

	if (req.responseText === '') {
		return;
	}

	return JSON.parse(req.responseText);
}

var normalizeHeaders = function(req) {
	var headers = {}, headerLines = req.getAllResponseHeaders().replace(/\r\n$/, '').split("\r\n");
	for (var i = 0, header; i < headerLines.length; i++) {
		header = headerLines[i].split(': ');
		headers[header[0].toLowerCase()] = header[1];
	}

	return headers;
}

var responseIsJson = function(req, headers) {
	return req.responseType == 'json' || headers['content-type'] == 'application/json';
}

/**
 * Convert an object into a query string
 * @param  {Object|Array|String} obj The object
 * @return {FormData}
 */
var param = function (obj) {

	if (typeof obj === 'string') {
		return obj;
	}

	return fd(obj, {
		indices: true
	});
};

var mergeHeaders = function(request, headers) {
	for (var header in headers) {
		if (headers.hasOwnProperty(header)) {
			request.setRequestHeader(header, headers[header]);
		}
	}
};

var makeRequest = function (url) {

	var request = new XMLHttpRequest();

	var xhrPromise = new Promise(function (resolve, reject) {

		request.onload = function () {

			if (request.status >= 200 && request.status < 300) {
				resolve(newResponse(request));
			} else {
				reject(newResponse(request));
			}

		};

		request.open(settings.method, url, true, settings.username, settings.password);
		request.responseType = settings.responseType;

		mergeHeaders(request, settings.headers);

		if (settings.timeout) {
			request.timeout = settings.timeout;
			request.ontimeout = function (e) {
				reject(newTimeoutResponse(request));
			};
		}

		if (settings.withCredentials) {
			request.withCredentials = true;
		}

		request.send(param(settings.data));
	});

	xhrPromise.cancel = function () {
		request.abort();
	};

	return xhrPromise;

};

export default Atomic;
