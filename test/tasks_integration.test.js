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

    it("should create a new task", async () => {
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

        expect(gevCreatedTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevCreatedTask.statusCode).toBe(201);
    })

    it("should forbid a creation of a new task", async () => {
        const gevCreateNewWorkspace = await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        const gevCreatedTask = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                title: "Buy some staff",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        expect(gevCreatedTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevCreatedTask.statusCode).toBe(416);
    })

    it("should update a task", async () => {
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

        const gevUpdatedTask = await request(app)
            .put(`/api/tasks/${gevCreatedTask.body.id}`)
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        expect(gevUpdatedTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevUpdatedTask.statusCode).toBe(200);
    })

    it("should forbid update a task", async () => {
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

        const gevUpdatedTask = await request(app)
            .put(`/api/tasks/${gevCreatedTask.body.id}`)
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevCreateNewWorkspace.body.id,
                completed: false
            });

        expect(gevUpdatedTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevUpdatedTask.statusCode).toBe(416);
    })
});
