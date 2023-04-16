const mongoose = require("mongoose");
const { appFactory } = require("../appFactory");
const { MongoMemoryServer } = require("mongodb-memory-server");
const AppStartupConfig = require("../config/appStartupConfig");
const request = require("supertest");

let mongoServer;
let testApp;
let testApiServer;

const users = {
  user1: null,
  user2: null,
  user3: null,
};

const setupBeforeAll = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const { app, server } = await appFactory(
    new AppStartupConfig(mongoUri, 3000)
  );
  testApp = app;
  testApiServer = server;
};

const setupBeforeEach = async () => {
  users.user1 = await createUser("user1", "Pass1234");
  users.user2 = await createUser("user2", "Pass1234");
  users.user3 = await createUser("user3", "Pass1234");
};

const setupAfterEach = async () => {
  await mongoose.connection.dropDatabase();
};

const setupAfterAll = async () => {
  await mongoServer.stop();
  await mongoose.disconnect();
  testApiServer.close();
};

const createUser = async (username, password) => {
  const res = await request(testApp)
    .post("/api/users/register")
    .send({ username, password });

  return {
    id: res.body.id,
    username: username,
    token: res.body.accessToken,
  };
};
module.exports = {
  setupBeforeAll,
  setupBeforeEach,
  setupAfterEach,
  setupAfterAll,
  getTestApp: () => testApp,
  users,
};
