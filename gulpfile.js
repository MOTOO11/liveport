var gulp = require('gulp');
var webpack = require('gulp-webpack');
var ts = require("gulp-typescript");
var packager = require("electron-packager");
gulp.task('default', ["build", "watch"]);
gulp.task("watch", () => {
    gulp.watch("./src/**/*.*", ["wp:b", "wp:b", "ts:compile"]);
});

gulp.task("build", ["wp:b", "wp:e", "ts:compile"]);

gulp.task('wp:b', () => {
    gulp.src('src/entry.js')
        .pipe(webpack(require('./webpack.browser.config.js')))
        .pipe(gulp.dest('build/'));
});

gulp.task('wp:e', () => {
    gulp.src('src/entry.js')
        .pipe(webpack(require('./webpack.electron.config.js')))
        .pipe(gulp.dest('build/'));
});

// define tasks here
gulp.task('ts:compile', () => {
    gulp.src("./src/ts/main.ts")
        .pipe(ts({
            target: 'ES5',
            removeComments: true
        }))
        .js
        .pipe(gulp.dest("./build/"));
});

gulp.task('e:p', (done) => {
    packager({
        dir: ".", // アプリケーションのパッケージとなるディレクトリ
        out: `./release`, // .app や .exeの出力先ディレクトリ
        arch: 'x64', // CPU種別. x64 or ia32
        platform: 'win32', // OS種別. darwin or win32 or linux
        //asar: true, // アーカイブ化
        prune: true, // exclude devDep
        version: '1.4.4' // Electronのversion
    }, function(err, path) {
        // 追加でパッケージに手を加えたければ, path配下を適宜いじる
        done();
    });
});