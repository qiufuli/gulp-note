const gulp = require('gulp');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

const imagemin = require('gulp-imagemin');




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


gulp.task('image',()=>{
  return gulp
  .src(['./src/**/*.jpg','./src/**/*.png','./src/**/*.gif'])
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({propressive: true}),
    imagemin.optipng({optimizationLevel: 5})
  ]))
  // optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
  // progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
  // interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
  // multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
  .pipe(gulp.dest('./build/img/'))
})



gulp.task('watch',()=>{
    gulp.watch(['./src/**/*'],['default'])
})


gulp.task('default',['js','style','image','watch']);