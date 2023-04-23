const request = require("supertest");
const {
  setupBeforeAll,
  setupBeforeEach,
  setupAfterEach,
  setupAfterAll,
  getTestApp,
} = require("./testConfiguration");

let testApp;
let users = {};

describe("Tasks Flow tests", () => {
  beforeAll(async () => {
    await setupBeforeAll();
    testApp = await getTestApp();
  });

  beforeEach(async () => {
    await setupBeforeEach();
    users.user1 = await createUser("user1", "Pass1234");
    users.user2 = await createUser("user2", "Pass1234");
    users.user3 = await createUser("user3", "Pass1234");
    users.user4 = await createUser("user4", "Pass1234");
  });

  afterEach(async () => {
    await setupAfterEach();
    users = {};
  });

  afterAll(async () => {
    await setupAfterAll();
  });

  describe("Task CRUD as admin", () => {
    let workspace;
    let adminTask;
    let memberTask;

    it("Should create workspace", async () => {
      workspace = await request(testApp)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${users.user1.token}`)
        .send({
          name: "Workspace",
        });
    });

    it("Should add members", async () => {
      const member = await request(testApp)
        .post(`/api/workspaces/${workspace.body.id}/members`)
        .set("Authorization", `Bearer ${users.user1.token}`)
        .send({
          member: {
            user: users.user2.id,
            role: "member",
          },
        });
    });

    it("Should create tasks", async () => {
      adminTask = await request(testApp)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${users.user1.token}`)
        .send({
          title: "admin- task 1",
          description: "description",
          completed: true,
          workspace: workspace.body.id,
        });

      memberTask = await request(testApp)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${users.user2.token}`)
        .send({
          title: "member- task 1",
          description: "description",
          completed: true,
          workspace: workspace.body.id,
        });

      expect(adminTask.statusCode).toBe(201);
      expect(memberTask.statusCode).toBe(201);
    });
  });
});

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
