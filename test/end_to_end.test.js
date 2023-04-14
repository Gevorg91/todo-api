const mongoose = require("mongoose");
const request = require("supertest");
const app = require('../app')
const {MongoMemoryServer} = require("mongodb-memory-server");

describe("End to End Integration Tests Suite ", () => {

    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase()
    });

    afterAll(async () => {
        await mongoServer.stop();
        await mongoose.disconnect();
    });

    it("should create new account by passing correct username and password", async () => {

        // Arrange
        const username = "me@tigranes.io";
        const password = "Pass1234!";

        // Act
        const res = await request(app).post("/api/users/register").send({
            username: username,
            password: password,
        });

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(201);
    });

    it("should sign in when provided correct username and password", async () => {

        // Arrange
        await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        // Act
        const signInResponse = await request(app).post("/api/users/login").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        // Assert
        expect(signInResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(signInResponse.statusCode).toBe(200);
    });

    it("should create a new workspace if a user has correct access token", async () => {

        // Arrange
        const responseFromRegistration = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        const accessToken = responseFromRegistration.body.accessToken;

        // Act
        const res = await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: "My First Workspace",
            });

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(201);
    });

    it("should get all workspaces of the user", async () => {

        // Arrange
        const responseFromRegistration = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        const accessToken = responseFromRegistration.body.accessToken;
        const userId = responseFromRegistration.body.id;

        await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: "My First Workspace",
            });

        // Act
        const res = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${accessToken}`)

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].name).toBe("My First Workspace");
        expect(res.body[0].owner).toBe(userId);
    });

    it("should get unauthorised when trying to access wrong Workspace", async () => {

        // Arrange
        const tigranRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        const tigranAccessToken = tigranRegistrationResponse.body.accessToken;
        const tigranUserId = tigranRegistrationResponse.body.id;

        const gevorRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "gev@gmail.com",
            password: "Pass1234!",
        });

        const gevorAccessToken = gevorRegistrationResponse.body.accessToken;
        const gevorUserId = gevorRegistrationResponse.body.id;

        await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace created By Tigran",
            });

        // Act
        const gevorWorkspacesResponse = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)

        const tigranWorkspacesResponse = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        const tigranUnauthorisedWorkspacesResponse = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer WRONG_ACCESS_TOKEN`)

        // Assert

        // Gevor
        expect(gevorWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(gevorWorkspacesResponse.statusCode).toBe(200);
        expect(gevorWorkspacesResponse.body.length).toBe(1);
        expect(gevorWorkspacesResponse.body[0].name).toBe("My First Workspace created By Gevor");
        expect(gevorWorkspacesResponse.body[0].owner).toBe(gevorUserId);
        expect(gevorWorkspacesResponse.body[0].members[0].user).toBe(gevorUserId);
        expect(gevorWorkspacesResponse.body[0].members[0].role).toBe("admin");

        // Tigran
        expect(tigranWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranWorkspacesResponse.statusCode).toBe(200);
        expect(tigranWorkspacesResponse.body.length).toBe(1);
        expect(tigranWorkspacesResponse.body[0].name).toBe("My First Workspace created By Tigran");
        expect(tigranWorkspacesResponse.body[0].owner).toBe(tigranUserId);
        expect(tigranWorkspacesResponse.body[0].members[0].user).toBe(tigranUserId);
        expect(tigranWorkspacesResponse.body[0].members[0].role).toBe("admin");

        // Tigran Unauthorised
        expect(tigranUnauthorisedWorkspacesResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranUnauthorisedWorkspacesResponse.statusCode).toBe(401);
    });

    it("should add Gevor to Tigran's Workspace as a member", async () => {

        // Arrange
        const tigranRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        const tigranAccessToken = tigranRegistrationResponse.body.accessToken;
        const tigranUserId = tigranRegistrationResponse.body.id;

        const gevorRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "gev@gmail.com",
            password: "Pass1234!",
        });

        const gevorAccessToken = gevorRegistrationResponse.body.accessToken;
        const gevorUserId = gevorRegistrationResponse.body.id;

        await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                name: "My First Workspace created By Tigran",
            });

        // Act
        await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)

        const tigranWorkspacesResponse = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        await request(app)
            .post(`/api/workspaces/${tigranWorkspacesResponse.body[0].id}/members`)
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                member: {
                    user: gevorUserId,
                    role: "member"
                }
            });

        const tigranWorkspacesResponseAfterGevAddition = await request(app)
            .get("/api/workspaces/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)

        // Assert
        expect(tigranWorkspacesResponseAfterGevAddition.body[0].members[0].role).toBe("admin");
        expect(tigranWorkspacesResponseAfterGevAddition.body[0].members[1].role).toBe("member");
    });

    it("Should forbid creation of a new task in wrong Workspace", async () => {
        // Arrange
        const tigranRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        const gevorRegistrationResponse = await request(app).post("/api/users/register").send({
            username: "gev@gmail.com",
            password: "Pass1234!",
        });

        const gevorAccessToken = gevorRegistrationResponse.body.accessToken;
        const gevorUserId = gevorRegistrationResponse.body.id;
        const tigranAccessToken = tigranRegistrationResponse.body.accessToken;
        const tigranUserId = tigranRegistrationResponse.body.id;

        const gevorCreateNewWorkspace = await request(app)
            .post("/api/workspaces/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)
            .send({
                name: "My First Workspace created By Gevor",
            });

        const gevorCreatedTask = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)
            .send({
                title: "Buy some staff",
                description: "This is my first task",
                workspace: gevorCreateNewWorkspace.body.id,
                completed: false
            });

        const gevorCreatedTaskUpdated = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${gevorAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevorCreateNewWorkspace.body.id,
                completed: false
            });

        // Act
        const tigranUpdatesGevorTask = await request(app)
            .post("/api/tasks/")
            .set('Authorization', `Bearer ${tigranAccessToken}`)
            .send({
                title: "Buy some staff - UPDATED",
                description: "This is my first task",
                workspace: gevorCreateNewWorkspace.body.id,
                completed: false
            });

        // Assert
        expect(tigranUpdatesGevorTask.header['content-type']).toBe('application/json; charset=utf-8');
        expect(tigranUpdatesGevorTask.statusCode).toBe(403);

    })
});
