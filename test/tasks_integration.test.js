const request = require("supertest");
const {
  setupBeforeAll,
  setupBeforeEach,
  setupAfterEach,
  setupAfterAll,
  getTestApp,
  users,
} = require("./testConfiguration");

describe("End to End Integration Tests For Tasks Flow ", () => {
  beforeAll(async () => {
    await setupBeforeAll();
  });

  beforeEach(async () => {
    await setupBeforeEach();
  });

  afterEach(async () => {
    await setupAfterEach();
  });

  afterAll(async () => {
    await setupAfterAll();
  });

  it("Task Create", async () => {});

  it("should create a new task", async () => {
    const testApp = await getTestApp();
    const workspace1 = await request(testApp)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        name: "Workspace1",
      });

    const gevCreatedTask = await request(testApp)
      .post("/api/tasks/")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        title: "Buy some staff",
        description: "This is my first task",
        workspace: workspace1.body.id,
        completed: false,
      });

    expect(gevCreatedTask.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(gevCreatedTask.statusCode).toBe(201);
  });
});
