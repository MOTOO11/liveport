const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
    entry: {
        "js/browser": './src/ts/Browser.ts'
    },
    output: {
        path: __dirname + "/build",
        filename: '[name].bundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
        new copyWebpackPlugin([{ from: './src/html/', to: "html/" }], {
            ignore: []
        })
        // ,        new DashboardPlugin()
    ],
    target: "web",
    node: {
        __filename: false,
        __dirname: false
    }
}