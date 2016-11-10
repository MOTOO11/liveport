const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    entry: {
        "js/browser": './src/entry.browser.js',
    },
    target: "web"
});