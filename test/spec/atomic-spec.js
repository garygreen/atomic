/**
 * atomic.js
 */
describe('atomic', function () {

	beforeEach(function() {
		jasmine.Ajax.install();
	});

	afterEach(function() {
		jasmine.Ajax.uninstall();
	});

	/**
	 * xhr
	 */
	describe('xhr', function () {

		it('should send GET request', function () {
			atomic('/endpoint');
			var request = jasmine.Ajax.requests.mostRecent();
			expect(request.url).toBe('/endpoint');
			expect(request.method).toBe('GET');
		});

		it('should allow sending POST request', function () {
			atomic('/endpoint', { method: 'POST' });
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.url).toBe('/endpoint');
			expect(request.method).toBe('POST');
		});

		it('should allow sending custom method', function () {
			atomic('/endpoint', { method: 'CUSTOM' });
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.url).toBe('/endpoint');
			expect(request.method).toBe('CUSTOM');
		});

		it('should call then callback when succesfull request', function(pass) {
			atomic('/endpoint')
			.then(function() {
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200
			});
		});

	});

	describe('response', function() {

		it('should set 200 status code', function(pass) {
			atomic('/endpoint')
			.then(function(response) {
				expect(response.status).toEqual(200);
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200
			});
		});

		it('should set 299 status code', function(pass) {
			atomic('/endpoint')
			.then(function(response) {
				expect(response.status).toEqual(299);
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 299
			});
		});

		it('should fail when <= 199 status code', function(pass) {
			atomic('/endpoint')
			.catch(function(response) {
				expect(response.status).toEqual(199);
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 199
			});
		});

		it('should fail when >= 300 status code', function(pass) {
			atomic('/endpoint')
			.catch(function(response) {
				expect(response.status).toEqual(300);
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 300
			});
		});

		it('should provide raw data', function(pass) {
			atomic('/endpoint')
			.then(function(response) {
				expect(response.data).toEqual('test');
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200,
				contentType: 'text/plain',
				responseText: 'test'
			});
		});

		it('should automatically decode json if response type is json', function(pass) {
			atomic('/endpoint', {
				responseType: 'json'
			})
			.then(function(response) {
				expect(response.data.first_name).toEqual('Bob');
				expect(response.data.last_name).toEqual('Sally');
				
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200,
				contentType: 'text/plain',
				responseType: 'json', // This needs to be set, even though it's not needed in the browser. See: https://github.com/jasmine/jasmine-ajax/issues/175
				responseText: JSON.stringify({ first_name: 'Bob', last_name: 'Sally' })
			});
		});

		it('should automatically decode json if response "Content-Type" is application/json', function(pass) {
			atomic('/endpoint')
			.then(function(response) {
				expect(response.data.fruit).toEqual('Strawberry');
				
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200,
				contentType: 'application/json',
				responseText: JSON.stringify({ fruit: 'Strawberry' })
			});
		});

		it('should provide original request in success', function(pass) {
			atomic('/endpoint')
			.then(function(response) {
				expect(response.request).toEqual(jasmine.any(XMLHttpRequest));
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 200
			});
		});

		it('should provide original request in fail', function(pass) {
			atomic('/endpoint')
			.catch(function(response) {
				expect(response.request).toEqual(jasmine.any(XMLHttpRequest));
				pass();
			});

			var request = jasmine.Ajax.requests.mostRecent();

			request.respondWith({
				status: 100
			});
		});

	})

	describe('contentType', function(){

		it('should use "application/x-www-form-urlencoded" as default Content-type', function(){
			atomic('/endpoint');
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.requestHeaders['Content-type']).toBe('application/x-www-form-urlencoded');
		});

		it('should be able to set custom type', function() {
			atomic('/endpoint', {
				headers: {
					'Content-type': 'application/json'
				}
			});
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.requestHeaders['Content-type']).toBe('application/json');
		});
		
		it('should be able to set custom header', function() {
			atomic('/endpoint', {
				headers: {
					'Custom-Header': 'Testing'
				}
			});
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.requestHeaders['Custom-Header']).toBe('Testing');
		});

	});

	describe('method aliases', function() {

		it('should alias get', function() {
			atomic.get('/endpoint');
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.method).toBe('GET')
			expect(request.url).toBe('/endpoint');
		});

		it('should alias post', function() {

			atomic.post('/endpoint', {
				first_name: 'John',
				last_name: 'Smith'
			});
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.method).toBe('POST')
			expect(request.url).toBe('/endpoint');
			expect(request.params.get('first_name')).toEqual('John');
			expect(request.params.get('last_name')).toEqual('Smith');
		});

	});

	describe('data params', function() {

		it('should allow multi array', function() {
			atomic.post('/endpoint', {
				users: [
					{
						name: 'John',
					},
					{
						name: 'Sally'
					}
				]
			});
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.method).toBe('POST')
			expect(request.url).toBe('/endpoint');
			expect(request.params.get('users[0][name]')).toEqual('John');
			expect(request.params.get('users[1][name]')).toEqual('Sally');
			
		});

		it('should allow passing string', function() {
			atomic.post('/endpoint', 'test');
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.params).toEqual('test');
		});

	});

	describe('setting defaults', function() {

		it('should allow setting defaults', function() {
			spyOn(XMLHttpRequest.prototype, 'setRequestHeader');

			var oldDefaults = Object.assign({}, atomic.defaults);

			atomic.defaults.username = 'test';
			atomic.defaults.headers = {
				'Some-Custom-Header': 'Blah',
				'Overide-Header': 'This should be overriden below.'
			};

			atomic('/endpoint', {
				headers: {
					'Another-Header': 'Blah',
					'Overide-Header': 'Overriden.'
				}
			}).then(function() {});


			expect(XMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith('Some-Custom-Header', 'Blah');
			expect(XMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith('Another-Header', 'Blah');
			expect(XMLHttpRequest.prototype.setRequestHeader).toHaveBeenCalledWith('Overide-Header', 'Overriden.');

			atomic.defaults = oldDefaults;
		});

	});

});