module.exports = {
    configureWebpack: {
        externals: {
        bindings: 'bindings',
        serialport: 'require("serialport")'
        }
    }
}