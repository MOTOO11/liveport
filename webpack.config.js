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
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }, {
                test: /\.js$/,
                loader: 'exports-loader'
            }, {
                test: /\.json$/,
                loader: "json-loader"
            }, {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?importLoaders=1',
                    'postcss-loader'
                ]
            }, {
                test: /\.less$/,
                loaders: [
                    'style-loader',
                    'css-loader?importLoaders=1',
                    'less-loader',
                    'postcss-loader'
                ]
            }, {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000&name=./fonts/[hash].[ext]'
            }
        ]
    },
    cache: true,
    devtool: '#eval',
    node: {
        __filename: false,
        __dirname: false
    }
}