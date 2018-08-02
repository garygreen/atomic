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

	});

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

		// it('should allow sending multi array', 

	});

	describe('method aliases', function() {

		it('should alias get', function() {
			atomic.get('/endpoint');
			var request = jasmine.Ajax.requests.mostRecent();

			expect(request.method).toBe('GET')
			expect(request.url).toBe('/endpoint');
		});

		it('should alias post', function() {
			// jasmine.Ajax.addCustomParamParser({
			// 	test: function(xhr) {
			// 		return true;
			// 	  // return true if you can parse
			// 	},
			// 	parse: function(params) {
			// 		// return params;
			// 		console.log('!!',params);
					
			// 	  // parse and return
			// 	}
			//   });

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