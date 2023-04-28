const mongoose = require("mongoose");
const { appFactory } = require("../appFactory");
const { MongoMemoryServer } = require("mongodb-memory-server");
const AppStartupConfig = require("../config/appStartupConfig");
const request = require("supertest");

let mongoServer;
let testApp;
let testApiServer;

const setupBeforeAll = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const { app, server } = await appFactory(
    new AppStartupConfig(mongoUri, 3000)
  );
  testApp = app;
  testApiServer = server;
};

const setupBeforeEach = async () => {};

const setupAfterEach = async () => {
  await mongoose.connection.dropDatabase();
};

const setupAfterAll = async () => {
  await mongoServer.stop();
  await mongoose.disconnect();
  testApiServer.close();
};

module.exports = {
  setupBeforeAll,
  setupBeforeEach,
  setupAfterEach,
  setupAfterAll,
  getTestApp: () => testApp,
};
