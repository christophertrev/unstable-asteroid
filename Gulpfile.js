// npm 'use strict';

var gulp      = require('gulp'),
    nodemon   = require('gulp-nodemon'),
    bs        = require('browser-sync'),
    reload    = bs.reload,
    when      = require('gulp-if'),
    shell     = require('gulp-shell');


// the paths to our app files
var paths = {
  // all our client app js files, not including 3rd party js files
  scripts: ['client/**/*.js'],
  html: ['client/**/*.html', 'client/index.html'],
  styles: ['client/styles/styles.css'],
  test: ['specs/**/*.js']
};

// any changes made to your
// client side code will automagically refresh your page
// with the new changes
gulp.task('start', ['serve']
  ,function () {
  bs({
    notify: true,
    // address for server,
    injectChanges: true,
    files: paths.scripts.concat(paths.html, paths.styles),
    proxy: 'localhost:8000'
    // server: {
    //   baseDir:'client',
    //   index: 'index.html'
    // }
  });
});

// gulp.task('karma', shell.task([
//   'karma start'
// ]));
gulp.task('docs', shell.task([
   'docco client/js/*.js server/*.js server/messages/*.js Gulpfile.js -l linear'
 ]));

// start our node server using nodemon
gulp.task('serve', function() {
  nodemon({script: 'server/server.js', ignore: 'node_modules/**/*.js'});
});

gulp.task('default', ['start']);