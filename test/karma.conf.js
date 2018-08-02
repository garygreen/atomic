module.exports = function (config) {
	config.set({
		basePath : '',
		autoWatch : false,
		frameworks: ['jasmine-ajax', 'jasmine'],
		browsers : ['ChromeHeadless'],
		files: [
			'../src/atomic.js',
			'spec/*.js',
		],
		plugins : [
			'karma-jasmine',
			'karma-jasmine-ajax',
			'karma-rollup-preprocessor',
			'karma-chrome-launcher',
			'karma-spec-reporter',
			'karma-coverage',
			'karma-htmlfile-reporter'
		],
		reporters : ['spec', 'coverage', 'html'],
		preprocessors: {
			'../src/atomic.js': ['rollup']
		},
		rollupPreprocessor: require('../rollup.config'),
		coverageReporter: {
			type : 'html',
			dir : 'coverage/'
		},
		htmlReporter: {
			outputFile: 'results/unit-tests.html'
		}
	});
};