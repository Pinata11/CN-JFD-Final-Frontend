const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js', // Removed the extra character 's'
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js', // Use the full build
            'vue': path.resolve(__dirname, 'node_modules/vue') // Ensure Vue resolves to a single location
          }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                  {
                    loader: 'url-loader',
                    options: {
                      limit: 8192, // Convert images < 8kb to base64 strings
                      name: 'images/[name].[hash:8].[ext]' // Output images to images folder
                    }
                  }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'), // Serve content from the 'dist' directory
        },
        compress: true,
        port: 8080,
        historyApiFallback: true,
    },
    externals: {
        config: JSON.stringify({
            apiUrl: process.env.API_URL || 'http://localhost:4000'
        })
    }
};
