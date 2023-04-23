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

  let workspace;
  let firstTaskCreatedByUser1;
  let secondTaskCreatedByUser1;
  let thirdTaskCreatedByUser1;
  let firstTaskCreatedByUser2;

  it("WORKSPACE CREATE", async () => {
    const testApp = await getTestApp();

    workspace = await request(testApp)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        name: "Workspace",
      });
    expect(workspace.statusCode).toBe(201);
  });

  it("WORKSPACE ADD MEMBER WITH MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const member = await request(testApp)
      .post(`/api/workspaces/${workspace.body.id}/members`)
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        member: {
          user: users.user2.id,
          role: "member",
        },
      });

    const guest = await request(testApp)
      .post(`/api/workspaces/${workspace.body.id}/members`)
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        member: {
          user: users.user3.id,
          role: "guest",
        },
      });

    expect(member.statusCode).toBe(200);
    expect(guest.statusCode).toBe(200);
  });

  // ADMIN ROLE
  it("TASK CREATE WITH ADMIN ROLE", async () => {
    const testApp = await getTestApp();

    firstTaskCreatedByUser1 = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        title: "user 1- task 1",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    secondTaskCreatedByUser1 = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        title: "user 1 - task 2",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    thirdTaskCreatedByUser1 = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        title: "user 1 - task 3",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    expect(firstTaskCreatedByUser1.statusCode).toBe(201);
    expect(secondTaskCreatedByUser1.statusCode).toBe(201);
    expect(thirdTaskCreatedByUser1.statusCode).toBe(201);
  });

  it("TASK GET BY ID WITH ADMIN ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser1.text);
    let task = await request(testApp)
      .get(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user1.token}`);
    expect(task.statusCode).toBe(200);
  });

  it("TASK UPDATE WITH ADMIN ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser1.text);
    let task = await request(testApp)
      .put(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user1.token}`)
      .send({
        title: "user 1 - task 1 - updated",
        description: "description",
        completed: true,
      });
    expect(task.statusCode).toBe(200);
  });

  it("TASK DELETE WITH ADMIN ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser1.text);
    let task = await request(testApp)
      .delete(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user1.token}`);
    expect(task.statusCode).toBe(200);
  });

  // MEMBER ROLE
  it("TASK CREATE WITH MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    firstTaskCreatedByUser2 = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user2.token}`)
      .send({
        title: "user 2- task 2",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    expect(firstTaskCreatedByUser2.statusCode).toBe(201);
  });

  it("GET USER2 TASK BY ID WITH MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser2.text);
    let task = await request(testApp)
      .get(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`);
    expect(task.statusCode).toBe(200);
  });

  it("GET USER1 TASK BY ID WITH USER2 MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(secondTaskCreatedByUser1.text);
    let task = await request(testApp)
      .get(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`);
    expect(task.statusCode).toBe(200);
  });

  it("UPDATE USER2 TASK WITH MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser2.text);
    let task = await request(testApp)
      .put(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`)
      .send({
        title: "user 2 - task 2 - updated",
        description: "description",
        completed: true,
      });
    expect(task.statusCode).toBe(200);
  });

  it("UPDATE USER1 TASK WITH USER1 MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(secondTaskCreatedByUser1.text);
    let task = await request(testApp)
      .put(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`)
      .send({
        title: "user 1 - task 1 - updated - by user 2",
        description: "description",
        completed: true,
      });
    expect(task.statusCode).toBe(200);
  });

  it("DELETE USER2 TASK WITH USER2 MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(firstTaskCreatedByUser2.text);
    let task = await request(testApp)
      .delete(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`);
    expect(task.statusCode).toBe(200);
  });

  it("DELETE USER1 TASK WITH USER2 MEMBER ROLE", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(secondTaskCreatedByUser1.text);
    let task = await request(testApp)
      .delete(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user2.token}`);
    expect(task.statusCode).toBe(200);
  });

  // GUEST ROLE
  it("TASK CREATE WITH GUEST ROLE FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const task = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user3.token}`)
      .send({
        title: "user 3 - task 1",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    expect(task.statusCode).toBe(416);
  });

  it("TASK GET BY ID WITH GUEST ROLE ALLOWED", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .get(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user3.token}`);
    expect(task.statusCode).toBe(200);
  });

  it("TASK UPDATE WITH GUEST ROLE FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .put(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user3.token}`)
      .send({
        title: "user 1 - task 3 - updated by user3",
        description: "description",
        completed: true,
      });
    expect(task.statusCode).toBe(416);
  });

  it("TASK DELETE WITH GUEST ROLE FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .delete(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user3.token}`);
    expect(task.statusCode).toBe(416);
  });

  // NOT WORKSPACE MEMBER
  it("TASK CREATE WITH NOT WORKSPACE MEMBER FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const task = await request(testApp)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${users.user4.token}`)
      .send({
        title: "user 4 - task 1",
        description: "description",
        completed: true,
        workspace: workspace.body.id,
      });

    expect(task.statusCode).toBe(416);
  });

  it("TASK GET BY ID WITH NOT WORKSPACE MEMBER FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .get(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user4.token}`);
    expect(task.statusCode).toBe(416);
  });

  it("TASK UPDATE WITH NOT WORKSPACE MEMBER FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .put(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user4.token}`)
      .send({
        title: "user 1 - task 3 - updated by user4",
        description: "description",
        completed: true,
      });
    expect(task.statusCode).toBe(416);
  });

  it("TASK DELETE WITH NOT WORKSPACE MEMBER FORBIDDEN", async () => {
    const testApp = await getTestApp();

    const responseBody = JSON.parse(thirdTaskCreatedByUser1.text);
    let task = await request(testApp)
      .delete(`/api/tasks/${responseBody.id}`)
      .set("Authorization", `Bearer ${users.user4.token}`);
    expect(task.statusCode).toBe(416);
  });
});
