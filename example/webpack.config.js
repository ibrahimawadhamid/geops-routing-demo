const webpack = require("webpack");
const {resolve, join} = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: resolve("./example/index.js"),
  devtool: "source-map",
  output: {
    path: join(__dirname, "dist"),
    filename: "index.js",
    publicPath: "/geops-routing-demo/"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    compress: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/,
        use: [{loader: "style-loader"}, {loader: "css-loader"}]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: "react",
      "react-dom": "react-dom"
    }),
    new HtmlWebpackPlugin({
      title: "geOps Routing Demo",
      template: resolve(__dirname, "./index.html")
    })
  ],
  cache: false
};
