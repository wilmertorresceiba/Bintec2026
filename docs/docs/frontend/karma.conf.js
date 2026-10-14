module.exports = function (config) {
  config.set({
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      
    ],
    reporters: ['progress', 'coverage', 'kjhtml'],
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/unit/'),
      subdir: '.',
      reporters: [
        { type: 'lcov', subdir: 'report-lcov' },
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'json', file: 'json/coverage-final-app.json' }
      ],
    },
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};