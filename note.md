第一步、安装gulp：
>全局的：npm i gulp -g        启动器
>本地的：npm i gulp           核心库

--------------------------------------------------------------------------------

第二步、编写配置：
gulpfile.js

gulp-uglify  压缩文件

gulp-concat 文件汇总到一起 都打包成一个js

gulp-rename 重命名

gulp-babel @babel/core @babel/preset-env  uglify不支持es6 写法 可以先babel下转为常用语法

gulp-sourcemaps 浏览器支持有限制

.pipe(sourcemaps.init()) 编译之前初始化

.pipe(babel({
    presets:['@babel/env']
    }))
  xxxxx
  xxxx

.pipe(sourcemaps.write()) 编译压缩之后的输出
.pipe(gulp.dest('./build/js'))

-------------------------------------------
gulp-cssmin  压缩css

gulp-imagemin 压缩图片

  // optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
  // progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
  // interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
  // multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化