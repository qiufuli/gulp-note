const gulp = require('gulp');

//默认情况下，每次运行时候所有的文件都会传递并通过整个管道。通过使用 gulp-changed 可以只让更改过的文件传递过管道。这可以大大加快连续多次的运行。
// https://www.gulpjs.com.cn/docs/recipes/only-pass-through-changed-files/
const gulpChanged = require('gulp-changed');
const gulpDebug = require('gulp-debug');
const htmlBeautify = require('gulp-html-beautify');
const runSequence = require('run-sequence');
const scss = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const cssBeautify = require('gulp-cssbeautify');

const del = require('del'); //删除文件或文件夹

// tools
const devConf = require('./build/dev-config');
const conf = require('./build/conf');
const utils = require('./build/utils');
// base变量 路径变量
const EVN_DEV = conf.EVN_DEV;
const EVN_PRO = conf.EVN_PRO;


const globs = conf.globs;
const browserSync = utils.browserSync;
const debug = utils.debug();

/* clean EVN_PRO file */
gulp.task('clean',function(cb){
  debug.info('delete history file');
  return del(`${EVN_PRO}/`, cb); //删除 dest/..
})

/* clean html */
gulp.task('clean-html', function(cb) {
  debug.info('delete history html file');
  return del(`${EVN_PRO}/**/*.html`, cb);
});

/* treat assets */
gulp.task('assets',function(){
  return gulp
  .src(globs.assets)
  .pipe(gulpChanged(EVN_PRO))
  .pipe(
    gulpDebug({
      title: '处理引用资源'
    })
  )
  .pipe(gulp.dest(EVN_PRO))
  .pipe(browserSync.stream())
})

// scss编译

gulp.task('scss', function() {
  return (
    gulp
      .src(globs.scssEntry)
      .pipe(utils.recordPath())
      .pipe(utils.wait(conf.SCSS_WAIT_TIME))
      .pipe(sourcemaps.init())
      .pipe(scss())
      .on('error', function(e) {
        console.error(e.message);
        this.emit('end');
      })
      .pipe(postcss([autoprefixer(['last 4 version'])]))
      // .pipe(rename(globs.scssOutput))
      .pipe(sourcemaps.write('./cssmaps'))
      .pipe(utils.changeOuput())
      .pipe(gulp.dest(EVN_PRO))
      .pipe(
        browserSync.reload({
          stream: true
        })
      )
  );
});

/* scss build编译 */
gulp.task('scss:build', function() {
  gulp
    .src(globs.scssEntry)
    .pipe(utils.recordPath())
    .pipe(scss())
    .on('error', function(e) {
      console.error(e.message);
      this.emit('end');
    })
    .pipe(postcss([autoprefixer(['last 4 version'])]))
    // .pipe(rename(globs.scssOutput))
    .pipe(utils.changeOuput())
    .pipe(
      cssBeautify({
        indent: '  '
      })
    )
    .pipe(gulp.dest(EVN_PRO));
});

/* include html file  */
gulp.task('include', function(cb) {
  return gulp.src(globs.include).pipe(utils.includeToAbsolutePath());
});

/* html file  */
gulp.task('html', function(cb) {
  return (
    gulp
      .src(globs.html)
      .pipe(gulpChanged(EVN_PRO))
      .pipe(utils.exchangeInclude())
      // .pipe(
      //  htmlBeautify({
      //    indent_size: 2,
      //    max_preserve_newlines: 0
      //  })
      // )
      .pipe(gulp.dest(EVN_PRO))
      .pipe(browserSync.stream())
  );
});

// 开发队列
gulp.task('dev-queue', function(cb) {
  runSequence('clean', 'include', ['html', 'assets', 'scss'], cb);
});

// 打包队列
gulp.task('build-queue', function(cb) {
  runSequence('clean', 'include', ['html', 'assets', 'scss:build'], cb);
});

// include 队列
gulp.task('include-queue', function(cb) {
  runSequence('clean-html', 'include', 'html', cb);
});

/* 开发 */
gulp.task('dev', ['dev-queue'], function() {
  utils.initServerProxy(devConf.dev);
  gulp.watch(globs.assets, ['assets']);
  gulp.watch(globs.html, ['html']);
  gulp.watch(globs.include, ['include-queue']);
  gulp.watch(globs.scss, ['scss']);
});

/* 生产模式打包 */
gulp.task('prod', ['build-queue']);

gulp.task('ie8', ['prod'], function() {
  gulp.watch(globs.assets, ['assets']);
  gulp.watch(globs.html, ['html']);
  gulp.watch(globs.include, ['include-queue']);
  gulp.watch(globs.scss, ['scss']);
  require('./build/server');
});