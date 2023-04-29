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

    //admin
it("should create workspace as an admin", async () => {
const createWorkspaceResponse = await createWorkspace(
    users.user1.token,
    {title: "admin workspace"}
);
expect(createWorkspaceResponse.statusCode).toBe(201);
});

    it("should get own workspace as an admin", async () => {
        const createWorkspaceResponse = await createWorkspace(
            users.user1.token,
            {title: "admin workspace"}
        );
        const createResponseBody = JSON.parse(createWorkspaceResponse.text);
        const getWorkspaceResponse = await getWorkspaceById(
            users.user1.token,
            createResponseBody.id
        );
        expect(getWorkspaceResponse.statusCode).toBe(200);
    });

    it("should get member workspace as an admin", async () => {
        const createWorkspaceResponse = await createWorkspace(
            users.user2.token,
            {title:"member workspace"}
        );
        const createResponseBody = JSON.parse(createWorkspaceResponse.text);

        const getWorkspaceResponse = await getWorkspaceById(
            users.user1.token,
            {title:"member worksapce"},
            createResponseBody.id
        );
        expect(getWorkspaceResponse.statusCode).toBe(200);
    });

    it("should edit own workspace as an admin", async () => {
        const createWorkspaceResponse = await createWorkspace(
            users.user1.token,
            {title: "admin workspace"}
        );
        const createResponseBody = JSON.parse(createWorkspaceResponse.text);

        const updateWorkspaceRequest = await editWorkspace(
            users.user1.token,
            {title: "admin workspace updated"},
            createResponseBody.id
        );

        expect(updateWorkspaceRequest.statusCode).toBe(200);
    });

    it("should edit member workspace as an admin", async () => {
    const createWorkspaceResponse = await createWorkspace(
        users.user2.token,
        {title: "member workspace"}
    );
    const createResponseBody = JSON.parse(createWorkspaceResponse.text);

    const updateWorkspaceRequest = await editWorkspace(
        users.user1.token,
        {title: "member workspace updated"},
        createResponseBody.id
    );
    expect(updateWorkspaceRequest.statusCode).toBe(200);
    });

it("should delete own workspace as an admin", async () => {
const createWorkspaceResponse = await createWorkspace(
    users.user1.token,
    {title:"admin workspace"}
);
const createResponseBody = JSON.parse(createWorkspaceResponse.text);
const deleteWorkspaceRequest = await deleteWorkspace(
    users.user1.token,
    {title:"admin workspace deleted"},
    createResponseBody.id
);
expect(deleteWorkspaceRequest.statusCode).toBe(200);
});


it("should delete member worskapce as an admin", async () => {
const createWorkspaceResponse = createWorkspace(
    users.user2.token,
    {title:"member workspace"}
)
    const createResponseBody = JSON.parse(createWorkspaceResponse.text);
const deleteWorkspaceRequest = await deleteWorkspace(
    users.user1.token,
    {title:"member workspace deleted"},
    createResponseBody.id
)
    expect(deleteWorkspaceRequest.statusCode).toBe(200)
});

//MEMBER

    it("should create workspace as a member", async () => {
    const createWorkspaceResponse = await createWorkspace(
        users.user2.token,
        {title:"member workspace"}
    )
        expect(createWorkspaceResponse.statusCode).toBe(200)
    }
});

    it("should get own workspace as a member", async () => {
        const createWorkspaceResponse = await createWorksapce (
            users.user2.token,
            {title:"member workspace"}
        )
        const createResponseBody = JSON.parse(createWorkspaceResponse.text)
        const getWorkspaceResponse = await getWorkspace(
            users.user2.token,
            {title:"member workspace"},
            createResponseBody.id
        )
        expect(getWorkspaceResponse.statusCode).toBe(200)
    });

    it("should get admin workspace as a member", async () => {
        const createWorkspaceResponse = await createWorkspace (
            users.user1.token,
            {title:"admin workspace"}
        )
        const createResponseBody = JSON.parse(createWorkspaceResponse.text)
        const getWorkspaceResponse = await getWorkspace(
            users.user2.token,
            {title:"admin workspace"},
            createResponseBody.id
        )
        expect(getWorkspaceResponse.statusCode).toBe(200)
    });

    it("should edit own workspace as a member", async () => {
        const createWorkspaceResponse = createWorkspace(
            users.user2.token,
            {title:"member workspace"}
        )
        const createResponseBody = JSON.parse(createWorksapceResponse.text)
        const updateWorkspaceResponse = await editWorkspace(
            users.user2.token,
            {title:"member workspace updated"},
            createResponseBody.id
        )
        expect(updateWorkspaceResponse.statusCode).toBe(200)
    })

it ("should edit admin workspace as a member", async () => {
    const createWorkspaceResponse = createWorkspace(
        users.user1.token,
        {title:"admin workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const updateWorkspaceResponse = await editWorkspace(
        users.user2.token,
        {title:"admin workspace updated"},
        createResponseBody.id
    )
    expect(updateWorkspaceResponse.statusCode).toBe(400)
});

    it("should delete own workspace as a member", async () => {
        const createWorkspaceResponse = await createWorkspace(
            users.user2.token,
            {title:"member workspace"}
        )
        const createResponseBody = JSON.parse(createWorkspaceResponse.text)
        const deleteWorkspaceResponse = await deleteWorkspace(
            users.user2.token,
            {title:"member workspace delete"},
            createResponseBody.id
        )
        expect(deleteWorkspaceReposnce.statisCode).toBe(200)
    });

    it("should not delete admin workspace as a member", async () => {
        createWorkspaceResponse = await createWorksapce(
            users.user1.token,
            {title:"admin workspace"}
        )
        const createResponseBody = JSON.parse(createWorksaceResponse.text)
        const deleteWorkspaceResponse = await deleteWorkspace(
            users.user2.token,
            {title:"admin workspace is not deleted"},
            createResponseBody.id
        )
        expect(deleteWorkspaceResponse.statusCode).toBe(400)
    });

    // GUEST
it("should not create a workspace as a guest", async () => {
    const createWorkspaceResponse = createWorkspace(
        users.user3.token,
        {title:"guest worskspace"}
    )
    expoect(createWorkspaceResponse.statusCode).toBe(400)
});

it("should get admin workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspace(
        users.user1.token,
        {title:"admin workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const getWorkspaceResponse = await getWorkspace(
        users.user3.token,
        {title:"admin workspace"},
        createResponseBody.id
    )
    expect(getWorkspaceResponse.statusCode).toBe(200)
});

it("should get member workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorksapce (
        users.user2.token,
        {title:"member workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const getWorkspaceResponse = await getWorkspace(
        users.user3.token,
        {title:"member workspace"},
        createResponseBody.id
    )
    expect(getWorkspaceResponse.statusCode).toBe(200)
});

it("should not edit admin workspace as a guest", async () => {
    cont createWorkspaceResponse = createWorkspace(
        users.user1.token,
        {title:"admin workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const editWorkspaceResponse = await editWorkspace(
        users.user3.token,
        {title:"admin workspace"},
        createResponseBody.id
    )
    expect(editWorkspaceResponse.statusCode).toBe(400)
});

it("should not edit member workspace as a guest", async () => {
    const createWorkspaceResponse = await createWorkspace(
        users.user2.token,
        {title:"member workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const editWorkspaceResponse = editWorkspace(
        users.user3.token,
        {title:"member workspace"},
        createResponseBody.id
    )
    expect(editWorkspaceResponse.statusCode).toBe(400)
});

it("should not delete admin workspace as a guest", async () => {
    cont createWorkspaceResponse = await createWorkspace(
        users.user1.token,
        {title:"admin workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const deleteWorkspaceResponse = await deleteWorkspace(
        users.user3.token,
        {title:"admin worksspace"},
        createResponseBody.id
    )
    expect(deleteWorkspaceResponse.statusCode).toBe(400)
});

it("should not delete member workspace as a guest", async () => {
    cont createWorkspaceResponse = await createWorkspace(
        users.user2.token,
        {title:"member workspace"}
    )
    const createResponseBody = JSON.parse(createWorkspaceResponse.text)
    const deleteWorksapceResponse = await deleteWorksapce(
        users.user3.token,
        {title:"member workspace"},
        createResponseBody.id
    )
    expect(deleteWorkspaceResponse.statusCpde).toBe(400)
});




//creare/get/edit/delete
const createWorkspace = async (token, title, workspaceId) => {
    return await request(testApp)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: title
        });
};

const getWorkspaceById = async (token, taskId) => {
    return await request(testApp)
        .get(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${token}`);
};

const editWorkspace = async (token, title, workspaceId) => {
    return await request(testApp)
        .put(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: title
        });
};

const deleteWorkspace = async (token, taskId) => {
    return await request(testApp)
        .delete(`/api/workspaces/${workspaceId}`)
        .set("Authorization", `Bearer ${token}`);
};