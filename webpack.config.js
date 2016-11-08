const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        // "js/main": './src/ts/Main.ts'
        "main": './src/ts/Main.ts'
    },
    output: {
        path: __dirname + "/build",
        filename: '[name].bundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
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
    ]
}