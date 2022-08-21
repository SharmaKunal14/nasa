const {
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById,
	exitsLaunchWithId,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
async function httpGetAllLaunches(req, res) {
	const { skip, limit } = getPagination(req.query);
	return res.status(200).json(await getAllLaunches(skip, limit));
}
async function httpAddNewLaunch(req, res) {
	const launch = req.body;
	if (
		!launch.mission ||
		!launch.rocket ||
		!launch.launchDate ||
		!launch.target
	) {
		return res.status(400).json({ error: "Missing required properties" });
	}
	launch.launchDate = new Date(launch.launchDate);
	if (isNaN(launch.launchDate)) {
		// console.log("In Date error", launch.launchDate);
		return res.status(400).json({ error: "Invalid Date" });
	}
	await scheduleNewLaunch(launch);
	return res.status(201).json(launch);
}
async function httpAbortLaunch(req, res) {
	const launchId = +req.params.id;
	if (!(await exitsLaunchWithId(launchId))) {
		return res.status(404).json({ error: "Launch not found" });
	}
	const abortedMission = await abortLaunchById(launchId);
	if (!abortedMission) {
		return res.status(400).json({ error: "Launch not aborted" });
	}
	return res.status(200).json({
		ok: true,
	});
}
module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
