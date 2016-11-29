const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    entry: {
        "renderer/js/app": './src/renderer/entry.ts'
    },
    output: {
        path: __dirname + "/build",
        filename: '[name].bundle.js'
    },
    module: {
        noParse: ['ws'] //
    },
    externals: ['ws'], // https://github.com/socketio/socket.io-client/issues/933
    target: "electron-renderer",
    plugins: [
        new copyWebpackPlugin([{
            from: './src/renderer/html/index.html',
            to: "renderer/html/"
        }], {
            ignore: []
        })
        // ,        new DashboardPlugin()
    ]
});