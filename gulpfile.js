var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    pleeease = require('gulp-pleeease'),
    bulkSass = require('gulp-sass-bulk-import'),
    header = require('gulp-header'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    notifier = require('node-notifier'),
    uglify = require('gulp-uglify'),
    sequence = require('run-sequence'),
    util = require('gulp-util'),
    neat = require('node-neat').includePaths,
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    path = require('path'),
    browserSync = require('browser-sync');

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


gulp.task('styles', function() {
  util.log('Building Styles');

  return gulp.src('lib/modules/apostrophe-assets/public/css/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
    onError: sassErrorHandler,
    includePaths: ['styles'].concat(neat)
  }))
    .pipe(sourcemaps.write())
    .pipe(rename(function(path) {
    path.dirname = "lib/modules/apostrophe-assets/public/css/";
    path.basename = "style";
    path.extname = ".less"
  }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  console.log('watching')
  gulp.watch('lib/modules/apostrophe-assets/public/css/**/*.scss', ['styles']);
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'app.js',
    ext: 'html js',
    watch: ["views/", "lib/modules/apostrophe-assets/public/css/*", "app.js", "lib/"],
  })
    .on('start', function onStart() {
    // ensure start only got called once
    if (!called) { cb(); }
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