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