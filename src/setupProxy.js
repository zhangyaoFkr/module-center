const { createProxyMiddleware } = require("http-proxy-middleware");
const subModules = require("../config/subModules.config");

function generateProxy(app, modules) {
  modules.forEach(m => {
    const modulePath = `/${m.name}`;
    app.use(
      modulePath,
      createProxyMiddleware({
        target: `${m.path}:${m.port}`,
        changeOrigin: true,
        pathRewrite: function(path, req) {
          return path.replace(modulePath, modulePath);
        }
      })
    );
  });
}

module.exports = function(app) {
  generateProxy(app, subModules);
};
