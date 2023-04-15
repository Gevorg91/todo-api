const mongoose = require("mongoose");
const request = require("supertest");
const {appFactory} = require("../appFactory")
const {MongoMemoryServer} = require("mongodb-memory-server");
const AppStartupConfig = require("../config/appStartupConfig");

describe("End to End Integration Tests for Users flow ", () => {

    let mongoServer;
    let testApp;
    let testApiServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const {app, server} = appFactory(new AppStartupConfig(mongoUri, 3000))
        testApp = app;
        testApiServer = server;
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase()
    });

    afterAll(async () => {
        await mongoServer.stop();
        await mongoose.disconnect();
        testApiServer.close();
    });

    it("should create new account by passing correct username and password", async () => {

        // Arrange
        const username = "me@tigranes.io";
        const password = "Pass1234!";

        // Act
        const res = await request(testApp).post("/api/users/register").send({
            username: username,
            password: password,
        });

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(201);
    });

    it("should sign in when provided correct username and password", async () => {

        // Arrange
        await request(testApp).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        // Act
        const signInResponse = await request(testApp).post("/api/users/login").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        // Assert
        expect(signInResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(signInResponse.statusCode).toBe(200);
    });


    it("should not create a new account with an email address that is already in use", async () => {
        // Arrange
        const username = "me@tigranes.io";
        const password = "Pass1234!";

        await request(testApp).post("/api/users/register").send({
            username: username,
            password: password,
        });

        // Act
        const res = await request(testApp).post("/api/users/register").send({
            username: username,
            password: password,
        });

        // Assert
        expect(res.header['content-type']).toBe('application/json; charset=utf-8');
        expect(res.statusCode).toBe(400);
    });

    it("should not sign in with an incorrect password", async () => {
        // Arrange
        await request(testApp).post("/api/users/register").send({
            username: "me@tigranes.io",
            password: "Pass1234!",
        });

        // Act
        const signInResponse = await request(testApp).post("/api/users/login").send({
            username: "me@tigranes.io",
            password: "wrongpassword",
        });

        // Assert
        expect(signInResponse.header['content-type']).toBe('application/json; charset=utf-8');
        expect(signInResponse.statusCode).toBe(401);
    });

});