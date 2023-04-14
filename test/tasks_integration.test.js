const mongoose = require("mongoose");
const request = require("supertest");
const systemUnderTest = require('../app');
const {MongoMemoryServer} = require("mongodb-memory-server");

describe("End to End Integration Tests For Tasks Flow ", () => {

    let mongoServer;
    let app = systemUnderTest.app;
    let testApiServer = systemUnderTest.server;

    let tigranAccessToken;
    let tigranUserId;
    let gevAccessToken;
    let gevUserId;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    beforeEach(async () => {
        const tigranRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        tigranAccessToken = tigranRegistrationResponse.body.accessToken;
        tigranUserId = tigranRegistrationResponse.body.id;

        const gevRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "gev@gmail.com",
            password: "Pass1234!",
        });

        gevAccessToken = gevRegistrationResponse.body.accessToken;
        gevUserId = gevRegistrationResponse.body.id;
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase()
    });

    afterAll(async () => {
        await mongoServer.stop();
        await mongoose.disconnect();
        testApiServer.close();
    });

    it("should forbid creation of a new task in wrong Workspace", async () => {
        const gevCreateNewWorkspace = await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        const gevCreatedTask = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                title: "Buy some staff",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        const gevCreatedTaskUpdated = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        // Act
        const tigranUpdatesGevTask = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        // Assert
        expect(tigranUpdatesGevTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranUpdatesGevTask.statusCode).toBe(403);
    })

});
