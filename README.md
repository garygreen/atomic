# Atomic [![Build Status](https://travis-ci.org/cferdinandi/atomic.svg)](https://travis-ci.org/cferdinandi/atomic)

A lightweight, Promise-based vanilla JS Ajax/HTTP library.

### Installation

```
npm install atomic2
```

**Direct Download**

You can [download the files directly from GitHub](https://github.com/garygreen/atomic/archive/master.zip).

```html
<script src="path/to/atomic.polyfills.min.js"></script>
```

### Usage

```js
// GET request
atomic('https://some-url.com')
  .then(function (response) {
	console.log(response.data); // xhr.responseText
	console.log(response.xhr);  // full response
  })
  .catch(function (error) {
	console.log(error.status); // xhr.status
	console.log(error.statusText); // xhr.statusText
  });

// POST request
atomic('https://some-url.com', { method: 'POST' })
  .then(...)
  .catch(...)
```

## ES6 Modules

```js
import('atomic').then(function (atomic) {
   atomic('https://some-url.com').then(...);
});
```

## Options and Settings

Atomic includes smart defaults and works right out of the box. You can pass options into Atomic through the `ajax()` function:

```js
atomic('https://some-url.com', {
	method: 'GET', // {String} the request type
	username: null, // {String} an optional username for authentication purposes
	password: null, // {String} an optional password for authentication purposes
	data: {}, // {Object|Array|String} data to be sent to the server
	headers: { // {Object} Adds headers to your request: request.setRequestHeader(key, value)
		'Content-type': 'application/x-www-form-urlencoded'
	},
	responseType: 'text', // {String} the response type (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
	timeout: null, // {Integer} the number of milliseconds a request can take before automatically being terminated
	withCredentials: false // {Boolean} If true, send credentials with request (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
});
```

## Canceling a Request

While Promises can't be canceled, Atomic does have an internal API for aborting your XHR request using the `cancel()` method.

In order to work, you must set your `atomic()` method to a variable without `.then()` methods. They can be called on the variable after setting.

```js
// Setup your request
var xhr = atomic('https://some-url.com');

// Handle responses
xhr.then(...);

// Cancel your request
xhr.cancel();
```

## Browser Compatibility

Atomic works in all modern browsers, and IE8 and above that supports Promises.

If your browser does not support Promises, use a polyfill.

## License

The code is available under the [MIT License](LICENSE.md).