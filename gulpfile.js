const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');

// Author: Cody Van De Mark

gulp.task('sass', () => {
  gulp.src('./scss/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./hosted'));
});

gulp.task('lint', () => gulp.src(['./server*.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('js', () => {
  gulp.src('./client/*.js')
  .pipe(babel({
    presets: ['env', 'react'],
  }))
  .pipe(gulp.dest('./hosted'));
});

gulp.task('build', ['sass', 'js', 'lint']);

gulp.task('watch', () => {
  gulp.watch('./scss/main.scss', ['sass']);
  gulp.watch('./client/*.js', ['js']);
  nodemon({ // Causes a loop?!
    script: './server/app.js',
    ext: 'js',
    tasks: ['lint'],
  });
});

/*
gulp.task('mongod', () => {

});
*/
