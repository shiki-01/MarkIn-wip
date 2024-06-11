import type { Configuration } from "webpack";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/electron.cjs",
  // Put your normal webpack config below here
  module: {
    rules: [
      // ...
      {
        test: /\.svelte?$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true
          }
        }
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
    extensions: [".js", ".ts", "cjs", ".jsx", ".svelte", ".css", ".json"],
    modules: ["./src", "./node_modules"],
  },
};