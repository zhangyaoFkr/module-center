const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    '/module-a',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/module-a': '/module-a', // rewrite path
      },
    })
  );
  app.use(
    '/module-b',
    createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      pathRewrite: {
        '^/module-b': '/module-b', // rewrite path
      },
    })
  );
};