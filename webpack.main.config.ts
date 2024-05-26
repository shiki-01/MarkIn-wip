import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  target: "electron-main",
  externals: {
    keytar: 'commonjs keytar'
  },
  entry: "./src/main/main.ts",
  // Put your normal webpack config below here
  module: {
    rules: [
      // ...
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
    modules: ["./src", "./node_modules"],
  },
};
