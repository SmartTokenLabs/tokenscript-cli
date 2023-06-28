const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: 'source-map',
    entry: {
        index: path.resolve(__dirname, './src/index.ts'),
		mint: path.resolve(__dirname, './src/mint.ts'),
		enter: path.resolve(__dirname, './src/enter.ts'),
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
        filename: '[name].js', // <- ensure unique bundle name
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
			filename: "index.html",
			template: path.resolve(__dirname, "./src/templates/index.html"),
			chunks: ["index"],
			scriptLoading: "blocking"
		}),
		new HtmlWebpackPlugin({
			filename: "mint.html",
			template: path.resolve(__dirname, "./src/templates/mint.html"),
			chunks: ["mint"],
			scriptLoading: "blocking"
		}),
		new HtmlWebpackPlugin({
			filename: "enter.html",
			template: path.resolve(__dirname, "./src/templates/enter.html"),
			chunks: ["enter"],
			scriptLoading: "blocking"
		}),
		new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*\.js/]),
    ],
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	}
};

