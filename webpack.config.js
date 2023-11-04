module.exports = {
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        fallback: {
            'util': require.resolve('util/')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
  ],
}