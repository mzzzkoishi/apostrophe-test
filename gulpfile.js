var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var notifier = require('node-notifier');
var uglify = require('gulp-uglify');
var sequence = require('run-sequence');
var util = require('gulp-util');
var rename = require('gulp-rename');
var neat = require('node-neat').includePaths;
var path = require('path');
var browserSync = require('browser-sync');

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 1000;

// Standard error handler
function standardHandler(err) {
  // Notification
  notifier.notify({
    message: 'Error: ' + err.message
  });
  // Log to console
  util.log(util.colors.red('Error'), err.message);
}

function sassErrorHandler(err) {
  standardHandler({
    message: err
  });
}

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})

gulp.task('styles', function () {
  util.log('Building Styles');

  return gulp.src('public/css/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      onError: sassErrorHandler,
      includePaths: ['styles'].concat(neat)
    }))
    .pipe(sourcemaps.write())
    .pipe(rename(function (path) {
      path.dirname = "public/css/";
      path.basename = "main";
      path.extname = ".less"
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
  console.log('watching')
  gulp.watch('public/css/**/*.scss', ['styles']);
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
      script: 'app.js',
      ext: 'html js',
      watch: ["views/", "public/css/*", "app.js", "lib/"],
    })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) {
        cb();
      }
      called = true;
    })
    .on('change', ['styles'])
    .on('restart', function () {
      console.log('restarting');
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    })
});

// Make sure `nodemon` is started before running `browser-sync`.
gulp.task('browser-sync', ['nodemon'], function () {
  var port = process.env.PORT || 3000;
  browserSync.init({
    // see http://www.browsersync.io/docs/options/
    files: ['public/**/*.*'],
    proxy: 'http://localhost:' + port, // Tells BrowserSync on where the express app is running
    port: 4000, // This port should be different from the express app port
    open: false
  });
});

gulp.task('default', function (done) {
  sequence('browser-sync', 'watch', done);
});