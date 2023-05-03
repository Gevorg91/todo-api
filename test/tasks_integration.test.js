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
  });

  // ADMIN
  it("should create task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    expect(createTaskResponse.statusCode).toBe(201);
  });

  it("should get own task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);
    const getTaskResponse = await getTaskById(
      users.user1.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(200);
  });

  it("should get member task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const getTaskResponse = await getTaskById(
      users.user1.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(200);
  });

  it("should edit own task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user1.token,
      "admin task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(200);
  });

  it("should edit member task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user1.token,
      "member task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(200);
  });

  it("should delete own task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user1.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(200);
  });

  it("should delete member task as a admin", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user1.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(200);
  });

  // MEMBER
  it("should create task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "admin task",
      workspace.body.id
    );
    expect(createTaskResponse.statusCode).toBe(201);
  });

  it("should get own task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);
    const getTaskResponse = await getTaskById(
      users.user2.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(200);
  });

  it("should get admin task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const getTaskResponse = await getTaskById(
      users.user2.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(200);
  });

  it("should edit own task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user2.token,
      "member task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(200);
  });

  it("should edit admin task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user2.token,
      "admin task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(200);
  });

  it("should delete own task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user2.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(200);
  });

  it("should delete admin task as a member", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user2.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(200);
  });

  // GUEST
  it("should not create task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user3.token,
      "admin task",
      workspace.body.id
    );
    expect(createTaskResponse.statusCode).toBe(416);
  });

  it("should get task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);
    const getTaskResponse = await getTaskById(
      users.user3.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(200);
  });

  it("should not edit task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user3.token,
      "admin task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(416);
  });

  it("should not delete task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user3.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(416);
  });

  // NOT WORKSPACE MEMBER
  it("should not create task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user4.token,
      "admin task",
      workspace.body.id
    );
    expect(createTaskResponse.statusCode).toBe(416);
  });

  it("should get task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);
    const getTaskResponse = await getTaskById(
      users.user4.token,
      createResponseBody.id
    );
    expect(getTaskResponse.statusCode).toBe(416);
  });

  it("should not edit task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user1.token,
      "admin task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const updateTaskRequest = await editTask(
      users.user4.token,
      "admin task updated",
      createResponseBody.id
    );

    expect(updateTaskRequest.statusCode).toBe(416);
  });

  it("should not delete task as a guest", async () => {
    const createTaskResponse = await createTask(
      users.user2.token,
      "member task",
      workspace.body.id
    );
    const createResponseBody = JSON.parse(createTaskResponse.text);

    const deleteTaskRequest = await deleteTask(
      users.user4.token,
      createResponseBody.id
    );

    expect(deleteTaskRequest.statusCode).toBe(416);
  });
});

const createTask = async (token, title, workspaceId) => {
  return await request(testApp)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: title,
      description: "description",
      completed: true,
      workspace: workspaceId,
    });
};

const getTaskById = async (token, taskId) => {
  return await request(testApp)
    .get(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`);
};

const editTask = async (token, title, taskId) => {
  return await request(testApp)
    .put(`/api/tasks/${taskId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: title,
      description: "description",
      completed: true,
    });
};

const deleteTask = async (token, taskId) => {
  return await request(testApp)
    .delete(`/api/tasks/${taskId}`)
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
