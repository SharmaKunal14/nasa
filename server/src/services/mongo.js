const mongoose = require("mongoose");
// const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, ".env") });
const MONGO_URL = process.env.MONGO_URL;
mongoose.connection.once("open", () => {
	console.log("MongoDB connection established");
});
mongoose.connection.on("error", (err) => console.log(err));

async function mongoConnect() {
	await mongoose.connect(MONGO_URL);
}
async function mongoDisconnect() {
	await mongoose.disconnect();
}
module.exports = {
	mongoConnect,
	mongoDisconnect,
};
