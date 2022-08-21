const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planets = require("./planets.mongo");
const habitablePlanets = [];
function isHabitablePlanet(planet) {
	return (
		planet["koi_disposition"] === "CONFIRMED" &&
		planet["koi_insol"] > 0.36 &&
		planet["koi_insol"] < 1.11 &&
		planet["koi_prad"] < 1.6
	);
}
function loadStreamData() {
	return new Promise((resolve, reject) => {
		fs.createReadStream(
			path.join(__dirname, "..", "..", "data", "kepler_data.csv")
		)
			.pipe(
				parse({
					comment: "#",
					columns: true,
				})
			)
			.on("data", async (chunk) => {
				if (isHabitablePlanet(chunk)) {
					savePlanet(chunk);
				}
			})
			.on("error", (err) => {
				reject(err);
			})
			.on("end", async () => {
				const numberOfPlanets = (await getAllPlanets()).length;
				console.log(numberOfPlanets);
				resolve();
			});
	});
}
async function getAllPlanets() {
	return await planets.find({}, { _id: 0, __v: 0 });
}
async function savePlanet(planet) {
	try {
		await planets.updateOne(
			{
				keplerName: planet.kepler_name,
			},
			{ keplerName: planet.kepler_name },
			{ upsert: true }
		);
	} catch (err) {
		console.log(`Could not save the planet: ${err.message}`);
	}
}
module.exports = {
	loadStreamData,
	getAllPlanets,
};
