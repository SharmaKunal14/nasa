const http = require("http");
require("dotenv").config({ path: __dirname + "/.env" });
const app = require("./app");
const { mongoConnect } = require("./services/mongo");
const { loadStreamData } = require("./models/planets.model");
const { loadLaunchesData } = require("./models/launches.model");
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
// mongoose.connection is an event emitter

async function startServer() {
	await mongoConnect();
	await loadStreamData();
	await loadLaunchesData();
	server.listen(PORT, () => {
		console.log(`listening on port ${PORT}`);
	});
}

startServer();
