const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path');
const htmlPlugin = new HtmlWebPackPlugin({
    template: "./public/main.html",
    filename: "./main.html"
});

const cssPlugin = new MiniCssExtractPlugin({
    filename: "./main.css"
});

module.exports = {
    mode: "development",
    entry: {
        app : ["./public/main.js"]
    },
    output: {
        path: path.resolve(__dirname, '.build'),
        filename: 'main.js'
    },
    plugins: [htmlPlugin, cssPlugin],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [{
                    loader: "babel-loader"
                }]
            },
            {
                test: /\.s?css$/,
                exclude: /node_modules/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                },
                {
                    loader: "css-loader",
                },
                {
                    loader: "sass-loader"
                }]
            }
        ]
    }
}