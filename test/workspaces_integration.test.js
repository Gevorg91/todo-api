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
let workspace;
let member;
let guest;

describe("Workspaces flow tests", () => {
  beforeAll(async () => {
    await setupBeforeAll();
    testApp = await getTestApp();

    users.user1 = await createUser("user1", "Pass1234");
    users.user2 = await createUser("user2", "Pass1234");
    users.user3 = await createUser("user3", "Pass1234");
    users.user4 = await createUser("user4", "Pass1234");

    workspace = await request(testApp)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        name: "Workspace",
      });

    member = await request(testApp)
      .post(`/api/workspaces/${workspace.body.id}/members`)
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        member: {
          user: users.user2.id,
          role: "member",
        },
      });

    guest = await request(testApp)
      .post(`/api/workspaces/${workspace.body.id}/members`)
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        member: {
          user: users.user3.id,
          role: "guest",
        },
      });
  });

  beforeEach(async () => {
    await setupBeforeEach();
  });

  afterEach(async () => {
    await setupAfterEach();
  });

  afterAll(async () => {
    await setupAfterAll();
    users = {};
  });

  it("admin", async () => {});
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
