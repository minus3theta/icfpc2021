let path = require("path");
let pathToPhaser = path.join(__dirname, "/node_modules/phaser/");
let phaser = path.join(pathToPhaser, "dist/phaser.js");

module.exports = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: "/node_modules/"
      },
      {
        test: /phaser\.js$/,
        loader: "expose-loader",
        options: {
          exposes: ["phaser"]
        }
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, "./"),
    publicPath: "/dist/",
    host: "localhost",
    port: 9000,
    open: false
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      phaser: phaser
    }
  }
}
