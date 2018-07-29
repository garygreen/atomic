module.exports = function (config) {
	config.set({
		basePath : '',
		autoWatch : false,
		frameworks: ['jasmine'],
		browsers : ['ChromeHeadless'],
		files: [
			'../src/js/atomic.js',
			'spec/*.js',
		],
		plugins : [
			'karma-rollup-preprocessor',
			'karma-chrome-launcher',
			'karma-spec-reporter',
			'karma-jasmine',
			'karma-coverage',
			'karma-htmlfile-reporter'
		],
		reporters : ['spec', 'coverage', 'html'],
		preprocessors: {
			'../src/js/atomic.js': ['rollup']
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