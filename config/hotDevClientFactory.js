
const CustomWebpackHotDevClient = require('./customWebpackHotDevClient');

(function hotDevClientFactory(ports) {
    ports.forEach(port => {
        const client = new CustomWebpackHotDevClient(port);
        client.connect();
    })
})(['3001', '3002']);



