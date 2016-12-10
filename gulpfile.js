var gulp = require('gulp');
var webpack = require('gulp-webpack');
var ts = require("gulp-typescript");
var rename = require("gulp-rename");
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
    dist: "./build/",
    src: "./src/"
}
gulp.task('default', (cb) => {
    runSequence("build", "serve", cb)
});
gulp.task("build", ["wp:b", "wp:r", "ts:compile", "assets:copy"]);

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


gulp.task('ts:compile', () => {
    return gulp.src("./src/electron/ts/Main.ts")
        .pipe(ts({
            target: 'ES5',
            removeComments: true
        }))
        .js
        .pipe(rename("main.js"))
        .pipe(gulp.dest(config.dist));
});

gulp.task('ts:compile:prod', () => {
    return gulp.src("./src/electron/ts/Main.prod.ts")
        .pipe(ts({
            target: 'ES5',
            removeComments: true
        }))
        .js
        .pipe(rename("main.js"))
        .pipe(gulp.dest(config.dist));
});

gulp.task("html:useref", () => {
    return gulp.src(config.dist + "**/*.html")
        .pipe(useref())
        .pipe(gulp.dest(config.dist, {
            base: config.dist
        }));
});
gulp.task("assets:copy", () => {
    return gulp.src(config.src + "assets/**/*.*")
        .pipe(gulp.dest(config.dist + "assets", {
            base: config.dist
        }));
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
    gulp.watch(config.dist + "browser/**/*.*", electron.reload);
});

const zip = require('gulp-zip');
const merge = require("event-stream").merge;
gulp.task("release", ["build"], (done) => {
    runSequence(["ts:compile:prod", "html:useref"]);
    packager({
        dir: ".", // アプリケーションのパッケージとなるディレクトリ
        out: "./release", // .app や .exeの出力先ディレクトリ
        arch: "x64,ia32", // CPU種別. x64 or ia32
        platform: "win32", // OS種別. darwin or win32 or linux
        icon: "./src/assets/icon/favicon.ico",
        //asar: true, // アーカイブ化
        // prune: true, // exclude devDep
        version: "1.4.8", // Electronのversion
        overwrite: true,
        ignore: [".vscode", "src", "typings",
            ".gitignore", "gulpfile.js", "postcss.config.js",
            "tsconfig.json", "typings.json", "README.md", "env.json", "doc",
            "webpack.browser.config.js", "webpack.config.js", "webpack.renderer.config.js"
        ]
    }, (err, path) => {
        if (err) {
            console.log(err);
            console.log(path);
        } else {
            console.log(path);
            gulp.src("README.md").pipe(gulp.dest(path[0]))
                .on("end", () => {
                    gulp.src("./" + path[0] + "/**", {
                            base: path[0]
                        })
                        .pipe(zip(path[0].split("\\")[1] + ".zip"))
                        .pipe(gulp.dest("./" + path[0].split("\\")[0]))
                        .on("end", () => {
                            gulp.src("README.md").pipe(gulp.dest(path[1]))
                                .on("end", () => {
                                    gulp.src("./" + path[1] + "/**", {
                                            base: path[1]
                                        })
                                        .pipe(zip(path[1].split("\\")[1] + ".zip"))
                                        .pipe(gulp.dest("./" + path[1].split("\\")[0]));
                                });

                        });
                });
        }
        done();
    });
});

var gutil = require('gulp-util');
var GitHubApi = require('github');
var pify = require('pify');
var fs = require('fs');

var pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var github = new GitHubApi();
var open = require("open");

const auth = require("./env.json").authenticate;
const release = {
    owner: "odangosan",
    repo: "liveport",
    dir: "release/",
    name: ["liveport-win32-x64", "liveport-win32-ia32"]
}
github.authenticate(auth);

gulp.task('gh:release', () => {
    return pify(github.repos.createRelease)({
            owner: release.owner,
            repo: release.repo,
            tag_name: "v" + pkg.version,
            body: "Release v" + pkg.version
        })
        .then((res) => {
            gutil.log('Release "' + res.tag_name + '" created');
            return res.id;
        })
        .then((id) => {
            return pify(github.repos.uploadAsset)({
                owner: release.owner,
                repo: release.repo,
                id: id,
                name: release.name[0] + "-" + pkg.version + '.zip',
                filePath: release.dir + release.name[0] + ".zip"
            })
        })
        .then((res) => {
            gutil.log('Asset "' + res.name + '" uploaded');
            return res.id
        }).then((id) => {
            return pify(github.repos.getReleaseByTag)({
                owner: release.owner,
                repo: release.repo,
                tag: "v" + pkg.version
            })
        }).then((res) => {
            gutil.log('Tag id "' + res.id + '"');
            return res.id
        }).then((id) => {
            return pify(github.repos.uploadAsset)({
                owner: release.owner,
                repo: release.repo,
                id: id,
                name: release.name[1] + "-" + pkg.version + '.zip',
                filePath: release.dir + release.name[1] + ".zip"
            })
        })
        .then((res) => {
            gutil.log('Asset "' + res.name + '" uploaded');
            open("https://github.com/odangosan/liveport/releases/tag/" + "v" + pkg.version);
        })
});