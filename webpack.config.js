const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');
const htmlPlugin = new HtmlWebPackPlugin({
    template: "./public/index.html",
    filename: "./index.html"
});

const cssPlugin = new MiniCssExtractPlugin();

module.exports = {
    mode: "development",
    entry: {
        app : ["./public/index.js"]
    },
    output: {
        path: path.resolve(__dirname, '.build'),
        filename: 'bundle.js'
    },
    plugins: [htmlPlugin, cssPlugin],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    }
}