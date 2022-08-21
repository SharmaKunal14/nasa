const axios = require("axios");
const ld = require("./launches.mongo");
const planetsDB = require("./planets.mongo");
const DEFAULT_FLIGHT_NUMBER = 100;
// const launch = {
// 	flightNumber: DEFAULT_FLIGHT_NUMBER, // flight_number
// 	mission: "Kepler Exploration X", // name
// 	rocket: "Explorer IS1", //rocket.name
// 	launchDate: new Date("December 27, 2030"), //date_local
// 	target: "Kepler-442 b", // N/A
// 	customers: ["ZTM", "NASA"], // payloads.customers
// 	upcoming: true, // upcoming
// 	success: true, // success
// };
// saveLaunch(launch);
const SPACEX_URL = "https://api.spacexdata.com/v4/launches/query";
async function populateLaunches() {
	const response = await axios.post(SPACEX_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: "rocket",
					select: {
						name: 1,
					},
				},
				{
					path: "payloads",
					select: {
						customers: 1,
					},
				},
			],
		},
	});
	if (response.status !== 200) {
		console.log("Error while loading the data");
		throw new Error("Error while loading the data");
	}
	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc["payloads"];
		const customers = payloads.flatMap((payload) => payload.customers);
		const launchData = {
			flightNumber: launchDoc["flight_number"],
			mission: launchDoc["name"],
			rocket: launchDoc["rocket"]["name"],
			launchDate: launchDoc["date_local"],
			upcoming: launchDoc["upcoming"],
			success: launchDoc["success"],
			customers: customers,
		};

		// console.log(launchData["flightNumber"]);
		saveLaunch(launchData);
	}
}
async function loadLaunchesData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		name: "Falcon 1",
	});
	if (firstLaunch) {
		console.log("Launches data already loaded");
	} else {
		await populateLaunches();
	}
}
async function findLaunch(filter) {
	return await ld.findOne(filter);
}
async function exitsLaunchWithId(launchId) {
	return await findLaunch({ flightNumber: launchId });
}
async function getAllLaunches(skip, limit) {
	return await ld
		.find({}, { _id: 0, __v: 0 })
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit);
}
async function getLatestFlightNumber() {
	const latestLaunch = await ld.findOne({}).sort("-flightNumber");
	if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
	return latestLaunch.flightNumber;
}
async function saveLaunch(launch) {
	await ld.findOneAndUpdate(
		{
			flightNumber: launch.flightNumber,
		},
		launch,
		{
			upsert: true,
		}
	);
}
async function scheduleNewLaunch(launch) {
	const planet = await planetsDB.findOne({ keplerName: launch.target });
	if (!planet) throw new Error("Couldn't find planet'");
	const flightNumber = (await getLatestFlightNumber()) + 1;
	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["ZTM", "NASA"],
		flightNumber: flightNumber,
	});
	await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
	const aborted = await ld.updateOne(
		{ flightNumber: launchId },
		{ success: false, upcoming: false }
	);
	return aborted.modifiedCount === 1;
}
module.exports = {
	getAllLaunches,
	loadLaunchesData,
	scheduleNewLaunch,
	abortLaunchById,
	exitsLaunchWithId,
};
