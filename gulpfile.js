const gulp        = require('gulp');
const babel       = require('gulp-babel');
const uglify      = require('gulp-uglify');
const rename      = require('gulp-rename');
const clean       = require('gulp-clean');
const jshint      = require('gulp-jshint');
const mocha       = require('gulp-mocha');
const sourcemaps  = require('gulp-sourcemaps');
const livereload  = require('gulp-livereload');

gulp.task('lint', () => {
  return gulp.src([
    './tests/**/*.es6.js',
    './src/**/*.es6.js'
  ])
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('clean', () => {
  gulp.src([
    'tests/**/*.map',
    'tests/**/*.js',
    '!tests/**/*.es6.js',
    'lib/**/*.map',
    'lib/**/*.js',
    'lib/**/*-flow.json',
    '*.log',
    '!node_modules/**/*',
    '!Gruntfile.js',
    './*.tgz',
  ])
  .pipe(clean({force: true}));
});

gulp.task('copyResources', () => {
  gulp.src('./src/**/*.{css,ico,png,html,json}')
  .pipe(gulp.dest('./lib'));
});

gulp.task('build', ['copyResources'], () => {
  return gulp.src('./src/**/*.es6.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      minified: true,
      compact: true,
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }))
    .pipe(uglify({
      mangle: {
      },
      compress: {
        dead_code: true,
        drop_debugger: true,
        properties: true,
        unused: true,
        toplevel: true,
        if_return: true,
        drop_console: true,
        conditionals: true,
        unsafe_math: true,
        unsafe: true
      },
    }))
    .pipe(rename((path) => {
      // truncate .es6 from basename
      path.basename = path.basename.substring(0, path.basename.length - 4);
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./lib'))
    .pipe(livereload());
});

gulp.task('copyTestResources', () => {
  gulp.src('./tests/**/*.{css,ico,png,html,json}')
  .pipe(gulp.dest('./lib'));
});

gulp.task('testBuild', ['build','copyTestResources'], () => {
  return gulp.src('./tests/**/*.es6.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      sourceMaps: true,
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./lib'));
});

gulp.task('watch', ['build'], () => {
  livereload.listen();
  gulp.watch('./src/*.js', ['build']);
});

gulp.task('test', ['lint', 'testBuild'], () => {
  return gulp.src([
    './lib/**/*.test.es6.js',
  ], {read: false})
  .pipe(mocha({
    require: ['source-map-support/register'],
    reporter: 'nyan'
  }))
});

gulp.task('default', ['build']);
