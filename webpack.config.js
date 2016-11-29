const copyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const DashboardPlugin = require('webpack-dashboard/plugin');
const webpack = require('webpack');

module.exports = {
    entry: {},
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json'],
        alias: {
            vue: 'vue/dist/vue.min.js'
        }
    },
    module: {
        loaders: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.tsx?$/,
                loader: 'ts'
            }, {
                test: /\.js$/,
                loader: 'exports'
            }, {
                test: /\.json$/,
                loader: "json"
            }, {
                test: /\.css$/,
                loaders: [
                    'style',
                    'css?importLoaders=1',
                    'postcss',
                    "resolve-url"

                ]
            }, {
                test: /\.less$/,
                loaders: [
                        'style',
                        'css?importLoaders=1',
                        'less',
                        'postcss'
                        // "resolve-url"

                    ]
                    // }, {
                    //     test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                    //     loader: 'url-loader?limit=100000&name=./fonts/[hash].[ext]'
                    // }
            },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=image/svg+xml&name=./fonts/[hash].[ext]' },
            { test: /\.woff(\d+)?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff&name=./fonts/[hash].[ext]' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff&name=./fonts/[hash].[ext]' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff&name=./fonts/[hash].[ext]' }
        ]
    },
    cache: true,
    devtool: '#eval',
    node: {
        __filename: false,
        __dirname: false
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        })
    ]
}