走进gulp的世界 -- by lbyang
一、什么是gulp？
1. gulp是前端开发过程中对代码进行构建的工具，是自动化项目的构建利器。
   它是一种基于nodeJs的自动任务运行器，即自动化地完成html/css/js/sass/less/image等文件的测试、检查、合并、压缩、格式化、实时刷新、部署文件生成等。
2. gulp与grunt的区别
    2.1 grunt是基于配置文件进行构建，而gulp是代码优于配置的策略，一个是写配置文件，一个是写代码。
    2.2 grunt的I/O过程中产生一些中间态的临时文件，例如A任务执行完后会生成一个临时文件，B任务会读取这个临时文件，再做自己的事，然后执行完成后也会生成一个临时文件。。。
        以此类推，其它任务可能会基于临时文件再做处理，最终形成构建后的文件。
    2.3 gulp是利用stream的方式进行文件处理，通过管道将任务和操作进行联系，因此只有一次I/O过程，
        流程更清晰，构建速度相比grunt也更快。当然啦~如果项目规模很小的话，这种差距可能就体现不出来了

二、如何使用gulp？
1. 安装
    1.1 安装node.js
            官网下载: https://nodejs.org/en/
    1.2 全局方式安装gulp
            $ npm install gulp -g
            验证：$ gulp -v  // 出现版本号，表示已经安装
            全局安装目的：通过它执行gulp任务
    1.3 新建package.json文件
            1. package.json是基于nodeJs项目必不可少的配置文件，用于存放项目根目录的普通json文件
            2. $ npm init
    1.4 本地安装gulp插件
            将项目中用到的gulp插件进行安装：
            $ npm install gulp-less                               [^_^]: 此处以less插件为例
    1.5 在项目根目录创建gulpfile.js文件
            1. 本地安装gulp：$ npm install gulp --save-dev
            2. 本地安装gulp目的：调用gulp插件的功能               [^_^]: 注意本地安装和全局安装的区别
            3. gulpfile.js是gulp项目的配置文件，位于项目根目录
2. 运行
    2.1 运行方式
        方式一：$ gulp 任务名称
        方式二：$ gulp /*文件根目录下直接执行*/
    2.2 运行gulp将会调用default任务里的所有任务

三、配置文件gulpfile.js
    gulp的使用流程一般是这样子的：
        首先通过gulp.src()方法获取到我们想要处理的文件流；
        然后把文件流通过pipe方法导入到gulp的插件中；
        最后把经过插件处理后的流再通过pipe方法导入到gulp.dest()中；
        gulp.dest()方法则把流中的内容写入到文件中

四、常用API
1. gulp.task
    gulp是基于task方式来运行,
    定义：gulp.task(name [, deps, fn]); 
        name表示任务名称，
        deps是可选项，表示这个task依赖的tasks,
        fn表示task要执行的函数
    示例：
        gulp.task('js',['xx', 'yy'], function() {
            return gulp.src('../src/a.js')
                       .pipe(gulp.dest('./build/'));
        });
    注意：xx和yy先执行，随后执行js的task;
          xx和yy是并行执行的，不是顺序执行

2. gulp.src
    定义：gulp.src(url[, options]);
        与url匹配的文件可以是string || array
    用来获取文件流，注意不是原始文件流，而是一个虚拟文件对象流。这个虚拟对象中存储着原始文件的路径、文件名、内容等。
    示例一：
        gulp.src(['a.js', 'b.js', '!c.js']);                    [^_^]: 注意本地安装和全局安装的区别 !表示排除该文件
    示例二：
        gulp.src('./src/ww/a.js', {base: './src/'})             [^_^]: options.base指多少路径被保留
            .pipe(gulp.dest('./build/'));                       [^_^]: 此处.src/ww/a.js会被输出到./build/ww/a.js
    [^_^]: 如果需要文件保持顺序，需要将出现在前面的文件写在数组前面，按顺序写即可

3. gulp.dest
    定义: gulp.dest(path[, options]);
    表示最终文件要输出的路径，options一般不用
    示例:
        gulp.dest('./build/');                                  [^_^]: 将文件输出到build文件下

4. gulp.watch
    监听文件的变化情况，然后运行指定的task或函数
    定义：gulp.watch(glob [, options], tasks);
    示例：
        gulp.watch('./src/**/*.scss', function() {
            console.log('我只是小小控制台~');
        });

五、gulp常用插件
1. gulp -- gulp基础库
    var gulp = require('gulp');

2. gulp-concat -- 合并文件
    var concat = require('gulp-concat');
    示例：
        gulp.task('cssapp', function() {
            gulp.src('src/app/**/*.scss')
                .pipe(concat('app.scss'))
                .pipe(gulp.dest('build/css'));
        });

3. gulp-minify-css -- 压缩css                 
    var cssmin = require('gulp-minify-css'); 
    示例：
        gulp.task('cssapp', function() {
            gulp.src('src/app/**/*.scss')
                .pipe(cssmin())
                .pipe(gulp.dest('build/css'));
        });

4. gulp-minify-html -- 压缩html           
    var htmlmin = require('gulp-minify-html');
    示例：
        gulp.task('htmlmin', function() {
            gulp.src(['src/**/*.html','!src/libs/**/*.html'])
                .pipe(htmlmin())
                .pipe(gulp.dest('build'));
        });  

5. gulp-uglify -- 压缩js
    var jsmin = require('gulp-uglify'); 
    示例：
        gulp.task('jsmin', function() {
            gulp.src(['src/**/*.js', '!src/libs/**/*.js'])
                .pipe(jsmin({
                    mangle: false
                }).on('error',plugins.util.log))
                .pipe(gulp.dest('build'))
                .pipe(connect.reload());
        }); 

6. gulp-imagemin  -- 压缩图片           
    var imagemin = require('gulp-imagemin');
    示例：
        gulp.task('imagemin', function() {
            gulp.src([
                'src/images/**/*.jpg',
                'src/images/**/*.png',
                'src/images/**/*.gif',
                'src/images/**/*.ico',
                'src/libs/**/*.gif',
                'src/libs/**/*.png'
            ], {
                base: 'src'
            })
            .pipe(imagemin({
                optimizationLevel: 5,           [^_^]:  默认为3，取值范围：0-7（优化等级）
                progressive: true,              [^_^]: 无损压缩jpg图片
                interlaced: true,               [^_^]: 隔行扫描gif进行渲染
                multipass: true                 [^_^]: 多次优化svg直到完全优化
            }))
            .pipe(gulp.dest('build'))
            .pipe(connect.reload())
        });

7. gulp-rename -- 重命名文件
    var rename = require('gulp-rename');
    示例： 
        gulp.task('test', function() {
            gulp.src('./src/**/*.scss')
            rename({suffix: '.min'});           [^_^]: 将scss文件压缩为xx.min.scss
        });

8. gulp-clean -- 清理目录
    var clean = require('gulp-clean');  
    示例：
        gulp.task('clean', function(){
            gulp.src(dist, {
                read: false
            })
            .pipe(clean({force: true}));
        }); 

9. gulp-connect -- 实时刷新
    var connect = require('gulp-connect');
    var proxy = require('http-proxy-middleware');
    示例：
        gulp.task('connect', function() {
            connect.server({
                root: localserver.baseUrl,                      // 服务启动的根目录
                port: localserver.prot,                         // 端口号
                livereload: true,                               // true, gulp自动检测文件变化，进行源码构建
                index: localserver.index,                       // 入口页面
                middleware: function(connect, opt) {
                    return Object.keys(localserver.proxy).map(key => {
                        return proxy(key, {
                            target: localserver.proxy[key],      // 将要访问的key请求都转发到target中去，代理会根据不同的请求选择正确的服务进行转发 
                            changeOrigin: true                   // Set the option changeOrigin to true for name-based virtual hosted sites
                        })
                    })
                }
            });
        });

10. gulp-sass -- 将sass转化为css
    var sass = require('gulp-sass');
    示例：
    ```javascript
    gulp.task('cssapp', function() {
        gulp.src('src/app/**/*.scss')
            .pipe(sass())
            .pipe(gulp.dest('build/css'));
    });
    ```

补充：
    var localserver = require('./localserver.config.json');     [^_^]: 依赖文件

六、参考链接：
http://www.gulpjs.com.cn/
https://gulpjs.com/
http://www.ydcss.com/
http://www.gulpjs.com.cn/docs/getting-started/