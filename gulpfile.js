var gulp = require('gulp');
var webpack = require('gulp-webpack');
var ts = require("gulp-typescript");
var useref = require("gulp-useref");
var packager = require("electron-packager");
var runSequence = require('run-sequence');
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
gulp.task('default', (cb) => {
    runSequence("build", "serve", cb)
});
gulp.task("build", ["wp:b", "wp:r", "ts:compile"]);

gulp.task('wp:b', () => {
    return gulp.src('./src/browser/entry.ts')
        .pipe(webpack(require('./webpack.browser.config.js')))
        .pipe(gulp.dest(config.dist));
});

gulp.task('wp:r', () => {
    return gulp.src('./src/renderer/entry.ts')
        .pipe(webpack(require('./webpack.renderer.config.js')))
        .pipe(gulp.dest(config.dist));
});

// define tasks here
gulp.task('ts:compile', () => {
    return gulp.src("./src/electron/ts/main.ts")
        .pipe(ts({
            target: 'ES5',
            removeComments: true
        }))
        .js
        .pipe(gulp.dest(config.dist));
});


gulp.task('serve', () => {
    var electron = electronServer.create({
        path: ".",
        stopOnClose: true,
    });
    // Start browser process
    electron.start(callback);
    // electron main process
    gulp.watch("./src/electron/ts/Main.ts", ["ts:compile"]);
    gulp.watch(config.dist + "main.js", () => {
        console.log("restart.");
        electron.restart(callback);
    });
    // electron renderer process
    gulp.watch("./src/renderer/**/*.*", ["wp:r"]);
    gulp.watch(config.dist + "renderer/**/*.*", electron.reload);

    // web server resource
    gulp.watch("./src/browser/**/*.*", ["wp:b"]);
    // gulp.watch(config.dist + "browser/**/*.*", electron.reload);
});

gulp.task('e:p', (done) => {
    gulp.src(config.dist + "**/*.html")
        .pipe(useref())
        .pipe(gulp.dest(config.dist, { base: config.dist }));
    packager({
        dir: ".", // アプリケーションのパッケージとなるディレクトリ
        out: `./release`, // .app や .exeの出力先ディレクトリ
        arch: 'x64', // CPU種別. x64 or ia32
        platform: 'win32', // OS種別. darwin or win32 or linux
        //asar: true, // アーカイブ化
        prune: true, // exclude devDep
        version: '1.4.4', // Electronのversion
        overwrite: true,
        ignore: [".vscode", "src", "typings",
            ".gitignore", "gulpfiles.js", "postcss.config.js",
            "tsconfig.json", "typings.json",
            "webpack.browser.config.js", "webpack.config.js", "webpack.renderer.config.js"
        ]
    }, function(err, path) {
        // 追加でパッケージに手を加えたければ, path配下を適宜いじる
        done();
    });
});