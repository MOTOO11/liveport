module.exports = {
    plugins: [
        require('postcss-import')(),
        require('autoprefixer')({
            browsers: ['last 2 versions']
        })
    ]
}