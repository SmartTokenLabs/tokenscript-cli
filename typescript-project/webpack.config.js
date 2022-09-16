const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: 'source-map',
    entry: {
        index: path.resolve(__dirname, './src/index.ts')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/inline',
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js', // <- ensure unique bundle name
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "./src/templates/index.html"),
			scriptLoading: "blocking"
		}),
		new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/bundle/]),
    ],
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	}
};

