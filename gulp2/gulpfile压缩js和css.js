const gulp = require('gulp');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');


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




gulp.task('style',()=>{
  return gulp
  .src(['./src/css/**/*.css'])
  .pipe(concat('common.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('./build/css/'))
})

gulp.task('default',['js','style']);