const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const babel = require('gulp-babel');

gulp.task('js',()=>{
  return gulp
  .src(['./src/js/**/*.js'])
  .pipe(babel({
    presets:['@babel/env']
    }))
  .pipe(concat('bundle.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./build/js'))
});

gulp.task('default',['js']);