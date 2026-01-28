module.exports = {
  devServer: {
    historyApiFallback: true,
    proxy: {
      "^/api": {
        target: "http://10.1.0.15/",
        ws: true,
        changeOrigin: true,
      },
      "^/log": {
        target: "http://10.1.0.15/",
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
