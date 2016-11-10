const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    entry: {
        "js/app": './src/entry.electron.js',
    },
    module: {
        noParse: ['ws'] //
    },
    externals: ['ws'], // https://github.com/socketio/socket.io-client/issues/933
    target: "electron"
});