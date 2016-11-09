var gulp = require('gulp');
var webpack = require('gulp-webpack');
var ts = require("gulp-typescript");
var packager = require("electron-packager");
var electronServer = require('electron-connect').server;
var callback = function(electronProcState) {
    console.log('electron process state: ' + electronProcState);
    if (electronProcState == 'stopped') {
        process.exit();
    }
};

config = {
    dist: "./build/"
}
gulp.task('default', ["build", "watch"]);
gulp.task("watch", () => {
    gulp.watch("./src/**/*.*", ["wp:b", "wp:b", "ts:compile"]);
});

gulp.task("build", ["wp:b", "wp:e", "ts:compile"]);

gulp.task('wp:b', () => {
    gulp.src('src/entry.js')
        .pipe(webpack(require('./webpack.browser.config.js')))
        .pipe(gulp.dest(config.dist));
});

gulp.task('wp:e', () => {
    gulp.src('src/entry.js')
        .pipe(webpack(require('./webpack.electron.config.js')))
        .pipe(gulp.dest(config.dist));
});

// define tasks here
gulp.task('ts:compile', () => {
    gulp.src("./src/ts/main.ts")
        .pipe(ts({
            target: 'ES5',
            removeComments: true
        }))
        .js
        .pipe(gulp.dest(config.dist));
});


gulp.task('serve', function() {
    var electron = electronServer.create({
        path: ".",
        stopOnClose: true,
    });
    // Start browser process
    electron.start(callback);
    // Restart browser process
    gulp.watch("./build/main.js", () => {
        console.log("restart.");
        electron.restart(callback);
    });
    // Reload renderer process
    // Reload renderer process
    gulp.watch([config.dist + 'index.html', config.dist + '/javascripts/app.js'], electron.reload);
    gulp.watch("./src/**/!(main.ts)", ["wp:b", "wp:b"]);
    gulp.watch("./src/**/main.ts", ["ts:compile"]);
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