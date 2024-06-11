import type { Configuration } from "webpack";
import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
});

export const rendererConfig: Configuration = {
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
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".cjs", ".svelte", ".css"],
    modules: ["./src", "./node_modules"],
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify")
    }
  },
};