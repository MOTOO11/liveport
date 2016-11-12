const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');

module.exports = {
    entry: {},
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json'],
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' },
            { test: /\.js$/, loader: 'exports-loader' },
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader'
                ]
            }
            // ,            {
            //     test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
            //     loader: 'file?name=css/[name].[ext]'
            // }
            , { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
        ]
    },
    node: {
        __filename: false,
        __dirname: false
    }
}