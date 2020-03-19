const CustomWebpackHotDevClient = require("./customWebpackHotDevClient");
const subModules = require("./subModules.config");

(function hotDevClientFactory(ports) {
  ports.forEach(port => {
    const client = new CustomWebpackHotDevClient(port);
    client.connect();
  });
})(subModules.map(m => m.port));
