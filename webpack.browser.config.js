const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    entry: {
        "browser/js/browser": './src/browser/entry.ts',
    },
    output: {
        path: __dirname + "/build",
        filename: '[name].bundle.js'
    },
    target: "web",
    plugins: [
        new copyWebpackPlugin([{
            from: './src/browser/html/browser.html',
            to: "browser/html/"
        }], {
            ignore: []
        })
        // ,        new DashboardPlugin()
    ]
});