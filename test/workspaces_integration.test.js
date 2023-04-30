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
  });

  beforeEach(async () => {
    await setupBeforeEach();
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

  afterEach(async () => {
    await setupAfterEach();
    users = {};
  });

  afterAll(async () => {
    await setupAfterAll();
    users = {};
  });

  it("should create workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      "admin workspace"
    );
    expect(createWorkspaceResponse.statusCode).toBe(201);
  });

  it("should get own workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      "admin workspace"
    );
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspaceByIdRequest(
      users.user1.token,
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should get member workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspaceByIdRequest(
      users.user1.token,
      { title: "member worksapce" },
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should edit own workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      {
        title: "admin workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const updateWorkspaceRequest = await editWorkspace(
      users.user1.token,
      { title: "admin workspace updated" },
      createResponseBody.id
    );

    expect(updateWorkspaceRequest.statusCode).toBe(200);
  });

  it("should edit member workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const updateWorkspaceRequest = await editWorkspace(
      users.user1.token,
      { title: "member workspace updated" },
      createResponseBody.id
    );
    expect(updateWorkspaceRequest.statusCode).toBe(200);
  });

  it("should delete own workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      {
        title: "admin workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorkspaceRequest = await deleteWorkspace(
      users.user1.token,
      { title: "admin workspace deleted" },
      createResponseBody.id
    );
    expect(deleteWorkspaceRequest.statusCode).toBe(200);
  });

  it("should delete member worskapce as an admin", async () => {
    const createWorkspaceResponse = createWorkspaceRequest(users.user2.token, {
      title: "member workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorkspaceRequest = await deleteWorkspace(
      users.user1.token,
      { title: "member workspace deleted" },
      createResponseBody.id
    );
    expect(deleteWorkspaceRequest.statusCode).toBe(200);
  });

  //MEMBER

  it("should create workspace as a member", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    expect(createWorkspaceResponse.statusCode).toBe(200);
  });

  it("should get own workspace as a member", async () => {
    const createWorkspaceResponse = await createWorksapce(users.user2.token, {
      title: "member workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspace(
      users.user2.token,
      { title: "member workspace" },
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should get admin workspace as a member", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      {
        title: "admin workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspace(
      users.user2.token,
      { title: "admin workspace" },
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should edit own workspace as a member", async () => {
    const createWorkspaceResponse = createWorkspaceRequest(users.user2.token, {
      title: "member workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const updateWorkspaceResponse = await editWorkspace(
      users.user2.token,
      { title: "member workspace updated" },
      createResponseBody.id
    );
    expect(updateWorkspaceResponse.statusCode).toBe(200);
  });

  it("should edit admin workspace as a member", async () => {
    const createWorkspaceResponse = createWorkspaceRequest(users.user1.token, {
      title: "admin workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const updateWorkspaceResponse = await editWorkspace(
      users.user2.token,
      { title: "admin workspace updated" },
      createResponseBody.id
    );
    expect(updateWorkspaceResponse.statusCode).toBe(400);
  });

  it("should delete own workspace as a member", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorkspaceResponse = await deleteWorkspace(
      users.user2.token,
      { title: "member workspace delete" },
      createResponseBody.id
    );
    expect(deleteWorkspaceReposnce.statisCode).toBe(200);
  });

  it("should not delete admin workspace as a member", async () => {
    createWorkspaceResponse = await createWorksapce(users.user1.token, {
      title: "admin workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorkspaceResponse = await deleteWorkspace(
      users.user2.token,
      { title: "admin workspace is not deleted" },
      createResponseBody.id
    );
    expect(deleteWorkspaceResponse.statusCode).toBe(400);
  });

  // GUEST
  it("should not create a workspace as a guest", async () => {
    const createWorkspaceResponse = createWorkspaceRequest(users.user3.token, {
      title: "guest worskspace",
    });
    expect(createWorkspaceResponse.statusCode).toBe(400);
  });

  it("should get admin workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      {
        title: "admin workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspace(
      users.user3.token,
      { title: "admin workspace" },
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should get member workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorksapce(users.user2.token, {
      title: "member workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const getWorkspaceResponse = await getWorkspace(
      users.user3.token,
      { title: "member workspace" },
      createResponseBody.id
    );
    expect(getWorkspaceResponse.statusCode).toBe(200);
  });

  it("should not edit admin workspace as a guest", async () => {
    const createWorkspaceResponse = createWorkspaceRequest(users.user1.token, {
      title: "admin workspace",
    });
    const createResponseBody = createWorkspaceResponse.body;
    const editWorkspaceResponse = await editWorkspace(
      users.user3.token,
      { title: "admin workspace" },
      createResponseBody.id
    );
    expect(editWorkspaceResponse.statusCode).toBe(400);
  });

  it("should not edit member workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const editWorkspaceResponse = editWorkspace(
      users.user3.token,
      { title: "member workspace" },
      createResponseBody.id
    );
    expect(editWorkspaceResponse.statusCode).toBe(400);
  });

  it("should not delete admin workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user1.token,
      {
        title: "admin workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorkspaceResponse = await deleteWorkspace(
      users.user3.token,
      { title: "admin worksspace" },
      createResponseBody.id
    );
    expect(deleteWorkspaceResponse.statusCode).toBe(400);
  });

  it("should not delete member workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspaceRequest(
      users.user2.token,
      {
        title: "member workspace",
      }
    );
    const createResponseBody = createWorkspaceResponse.body;
    const deleteWorksapceResponse = await deleteWorksapce(
      users.user3.token,
      { title: "member workspace" },
      createResponseBody.id
    );
    expect(deleteWorkspaceResponse.statusCpde).toBe(400);
  });
});

//create/get/edit/delete
const createWorkspaceRequest = async (token, name) => {
  return await request(testApp)
    .post("/api/workspaces")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: name,
    });
};

const getWorkspaceByIdRequest = async (token, workspaceId) => {
  return await request(testApp)
    .get(`/api/workspaces/${workspaceId}`)
    .set("Authorization", `Bearer ${token}`);
};

const editWorkspace = async (token, title, workspaceId) => {
  return await request(testApp)
    .put(`/api/workspaces/${workspaceId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: title,
    });
};

const deleteWorkspace = async (token, workspaceId) => {
  return await request(testApp)
    .delete(`/api/workspaces/${workspaceId}`)
    .set("Authorization", `Bearer ${token}`);
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
