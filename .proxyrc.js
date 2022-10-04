const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://api.pinterdev.com/",
      // target: "https://api-cvuerings.pinterdev.com/",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "",
      },
    }),
  );
  app.use(
    createProxyMiddleware("/image", {
      target: "https://i.pinimg.com/",
      changeOrigin: true,
      pathRewrite: {
        "^/image": "",
      },
    }),
  );
};
