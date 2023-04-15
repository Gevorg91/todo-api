const mongoose = require("mongoose");
const request = require("supertest");
const {appFactory} = require("../appFactory")
const {MongoMemoryServer} = require("mongodb-memory-server");

describe("End to End Integration Tests Suite For Workspaces Flow", () => {

    let mongoServer;
    let testApp;
    let testApiServer;

    let tigranAccessToken;
    let tigranUserId;
    let gevAccessToken;
    let gevUserId;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        const {app, server} = appFactory(mongoUri)
        testApp = app;
        testApiServer = server;
    });

    beforeEach(async () => {
        const tigranRegistrationResponse = await request(testApp).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        tigranAccessToken = tigranRegistrationResponse.body.accessToken;
        tigranUserId = tigranRegistrationResponse.body.id;

        const gevRegistrationResponse = await request(testApp).post("/api/users/register").send({
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

    // STEP - 1 -> Creating new Workspace for Gev
    it("should get all Workspaces of the user", async () => {

        // Creating new Workspace for Gev
        await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace",
            });

        // Act
        const res = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].name).toBe("My First Workspace");
        expect(res.body[0].owner).toBe(tigranUserId);
    });

    // STEP - 1 -> Creating new Workspace for Gev
    it("should create a new workspace if a user has correct access token", async () => {
        const res = await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace",
            });

        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(201);
    });

    it("should not create a new workspace without an access token", async () => {
        // Arrange

        // Act
        const res = await request(testApp)
            .post("/api/workspaces/")
            .send({
                name: "My First Workspace",
            });

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(401);
    });

    it("should return a bad request when attempting to create a workspace with a missing name", async () => {
        // Act
        const res = await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({});

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(400);
    });

    it("should get a single workspace by ID", async () => {
        const workspaceResponse = await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace",
            });

        const workspaceId = workspaceResponse.body.id;

        // Act
        const res = await request(testApp)
            .get(`/api/workspaces/${workspaceId}`)
            .set('Authorization', `Bearer ${tigranAccessToken}`);

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("My First Workspace");
        expect(res.body.owner).toBe(tigranUserId);
    });

    it("should get unauthorised when trying to access wrong Workspace", async () => {
        await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace created By Tigran",
            });

        // Act
        const gevorWorkspacesResponse = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)

        const tigranWorkspacesResponse = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        const tigranUnauthorisedWorkspacesResponse = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer WRONG_ACCESS_TOKEN`)

        // Assert

        // Gevor
        expect(gevorWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevorWorkspacesResponse.statusCode).toBe(200);
        expect(gevorWorkspacesResponse.body.length).toBe(1);
        expect(gevorWorkspacesResponse.body[0].name).toBe("My First Workspace created By Gevor");
        expect(gevorWorkspacesResponse.body[0].owner).toBe(gevUserId);
        expect(gevorWorkspacesResponse.body[0].members[0].user).toBe(gevUserId);

        // Tigran
        expect(tigranWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranWorkspacesResponse.statusCode).toBe(200);
        expect(tigranWorkspacesResponse.body.length).toBe(1);
        expect(tigranWorkspacesResponse.body[0].name).toBe("My First Workspace created By Tigran");
        expect(tigranWorkspacesResponse.body[0].owner).toBe(tigranUserId);
        expect(tigranWorkspacesResponse.body[0].members[0].user).toBe(tigranUserId);

        // Tigran Unauthorised
        expect(tigranUnauthorisedWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranUnauthorisedWorkspacesResponse.statusCode).toBe(401);
    });


    // STEP - 1 -> Creating new Workspace for Gev
    // STEP - 2 -> Creating new Workspace for Tigran
    // STEP - 3 -> Getting all workspaces for Gev
    // STEP - 4 -> Getting all workspaces for Tigran
    // STEP - 5 -> Adding Gev to Tigran's Workspace
    // STEP - 6 -> Getting all Workspaces for Tigran after adding Gev
    it("should add Gev to Tigran's Workspace as a member", async () => {

        // Creating new Workspace for Gev
        await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        // Creating new Workspace for Tigran
        await request(testApp)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace created By Tigran",
            });

        // Getting all workspaces for Gev
        await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${gevAccessToken}`)

        // Getting all workspaces for Tigran
        const tigranWorkspacesResponse = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        // Adding Gev to Tigran's Workspace
        await request(testApp)
            .post(`/api/workspaces/${tigranWorkspacesResponse.body[0].id}/members`)
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                member: {
                    user: gevUserId
                }
            });

        // Getting all Workspaces for Tigran after adding Gev
        const tigranWorkspacesResponseAfterGevAddition = await request(testApp)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        // Assert
        expect(tigranWorkspacesResponseAfterGevAddition.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranWorkspacesResponseAfterGevAddition.body[0].members.length).toBe(2);
    });
});
