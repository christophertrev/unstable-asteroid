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
  styles: ['client/styles/**.css'],
  test: ['specs/**/*.js']
};

// any changes made to to the client side
// will automagically refresh your page
// with the new changes
gulp.task('start', ['serve']
  ,function () {
  bs({
    notify: true,
    injectChanges: true,
    files: paths.scripts.concat(paths.html, paths.styles),
    proxy: 'localhost:8000'
  });
});

gulp.task('docs', shell.task([
   'docco client/js/*.js server/*.js server/messages/*.js Gulpfile.js -l linear'
 ]));

// start our node server using nodemon
gulp.task('serve', function() {
  nodemon({script: 'server/server.js', ignore: 'node_modules/**/*.js'});
});

gulp.task('default', ['start']);