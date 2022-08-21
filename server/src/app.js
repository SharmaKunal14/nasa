const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const api = require("./routes/api");
const app = express();
// const whitelist = ["http://localhost:3000"];
// const corsOptions = {
// 	origin: function (origin, callback) {
// 		if (whitelist.indexOf(origin) !== -1) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("Not allowed by CORS"));
// 		}
// 	},
// };
// app.use(cors(corsOptions));
app.use(
	cors({
		origin: "http://localhost:3000",
	})
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/v1", api);
app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
module.exports = app;
