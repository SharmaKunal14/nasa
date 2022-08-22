const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadStreamData } = require("../../models/planets.model");
describe("Test Launches API", () => {
	beforeAll(async () => {
		await mongoConnect();
		await loadStreamData();
	});
	afterAll(async () => {
		await mongoDisconnect();
	});
	describe("GET /launches", () => {
		test("Response should be 200", async () => {
			const response = await request(app)
				.get("/v1/launches")
				.expect("Content-Type", /json/)
				.expect(200);
		});
	});

	describe("POST /launches", () => {
		const completeLaunchData = {
			mission: "MARS",
			launchDate: "January 29, 2040",
			rocket: "IS1",
			target: "Kepler-62 f",
		};
		const launchDataWithoutDate = {
			mission: "MARS",
			rocket: "IS1",
			target: "Kepler-62 f",
		};
		const lauchDataWithInvalidDate = {
			mission: "MARS",
			launchDate: "kuch bhi",
			rocket: "IS1",
			target: "Kepler-62 f",
		};
		test("Response should be 201", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(completeLaunchData)
				.expect("Content-Type", /json/)
				.expect(201);

			const requestDate = new Date(
				completeLaunchData.launchDate
			).valueOf();
			const responseDate = new Date(response.body.launchDate).valueOf();
			expect(requestDate).toBe(responseDate);
			expect(response.body).toMatchObject(launchDataWithoutDate);
		});
		test("Response should be 400", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(launchDataWithoutDate)
				.expect(400)
				.expect("Content-Type", /json/);
			expect(response.body).toStrictEqual({
				error: "Missing required properties",
			});
		});
		test("Response should be 400", async () => {
			const response = await request(app)
				.post("/v1/launches")
				.send(lauchDataWithInvalidDate)
				.expect(400)
				.expect("Content-Type", /json/);
			expect(response.body).toStrictEqual({
				error: "Invalid Date",
			});
		});
	});
});
