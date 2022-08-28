const content = process.env.CONFIG_URL ?? "http://localhost:5000";

module.exports = {
    configureWebpack: {
        devtool: 'source-map'
    },
}