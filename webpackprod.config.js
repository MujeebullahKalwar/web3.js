const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
	mode: 'production',
	entry: path.resolve(__dirname, 'packages/web3/src/index.ts'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'web3.js',
		library: 'Web3',
		libraryExport: 'default',
		libraryTarget: 'umd',
		globalObject: 'this',
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: ['/node_modules/', '/unit/'],
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			child_process: false,
			fs: false,
			net: false,
			path: false,
			os: false,
			util: require.resolve('util'),
			http: require.resolve('http-browserify'),
			https: require.resolve('https-browserify'),
			crypto: require.resolve('crypto-browserify'),
			stream: require.resolve('readable-stream'),
		},
	},
	devtool: 'source-map',
	plugins: [
		new CleanWebpackPlugin({
			verbose: true,
		}),
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
};

module.exports = () => {
	return config;
};