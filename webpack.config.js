import { resolve, join } from 'path';

export const entry = './frontend/src/index.js';
export const output = {
    path: resolve(__dirname, 'frontend/static/frontend'),
    filename: 'main.js'
};
export const module = {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        
        },

    ]
};
export const devServer = {
    contentBase: join(__dirname, 'frontend/static/frontend'),
    compress: true,
    port: 9000
};