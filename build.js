const packager = require("electron-packager");
// 毎回オプションを書き直すのは面倒くさいのでpackage.jsonから引っ張ってくる
const package = require("./package.json");
packager({
    name: package["name"],
    dir: "./", // アプリケーションのパッケージとなるディレクトリ
    "out": "./release", // .app や .exeの出力先ディレクトリ
    arch: "x64", // CPU種別. x64 or ia32
    platform: "win32" // OS種別. darwin or win32 or linux
        // asar: true, // アーカイブ化
        // prune: true, // exclude devDep
        // "version": "1.4.6", // Electronのversion
        // "overwrite": true,
        // "ignore": [".vscode", "src", "typings",
        //         ".gitignore", "gulpfiles.js", "postcss.config.js",
        //         "tsconfig.json", "typings.json",
        //         "webpack.browser.config.js", "webpack.config.js", "webpack.renderer.config.js"
        //     ]
        // icon: "./source/icon.ico", // アイコンのパス
        // "app-version": package["version"] // アプリバージョン
        // "app-copyright": "Copyright (C) 2016 " + package["author"] + ".", // コピーライト

    // "version-string": { // Windowsのみのオプション
    //     CompanyName: "totoraj.net",
    //     FileDescription: package["name"],
    //     OriginalFilename: package["name"] + ".exe",
    //     ProductName: package["name"],
    //     InternalName: package["name"]
    // }

}, function(err, appPaths) { // 完了時のコールバック
    if (err) console.log(err);
    console.log("Done: " + appPaths);
});