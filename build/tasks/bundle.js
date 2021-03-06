var gulp = require('gulp');
var bundler = require('aurelia-bundler');
var bundles = require('../bundles.js');

var config = {
  force: true,
  baseURL: './app',
  configPath: './app/config.js',
  bundles: bundles.bundles
};

gulp.task('bundle', ['unbundle', 'build-release'], function() {
  return bundler.bundle(config);
});

gulp.task('unbundle', function() {
  return bundler.unbundle(config);
});
