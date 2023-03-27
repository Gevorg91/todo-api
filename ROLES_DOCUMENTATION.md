# Roles Documentation

This document outlines the roles and permissions for users in the 
application, specifically in relation to My Day and Workspaces.

## My Day

My Day is a private space for each user, which is only accessible 
to the owner. Users can create and manage tasks, notes, and events 
within My Day. It is also possible to import items from available 
Workspaces, provided the user has the necessary permissions.

The following API endpoints are available for My Day:

```angular2html
api/my-day/865827438643
api/my-day/865827438643/tasks
api/my-day/865827438643/notes
api/my-day/865827438643/events
```

## Workspaces

Workspaces are public spaces that users can create to collaborate
with other users. Members can create tasks, notes, events, and other 
items within a Workspace. Additional features such as chats or forums
can be added if required.

The following API endpoints are available for Workspaces:

```angular2html
api/workspace/865827438643
api/workspace/865827438643/tasks
api/workspace/865827438643/notes
api/workspace/865827438643/events
```

## Roles and Permissions

To manage access to My Day and Workspaces, the application requires 
several middleware functions. For Workspaces, the middleware checks if:

- The Workspace ID is provided in the path
- The Workspace entity can be fetched from the database using the provided ID
- The current user is a member of the Workspace

The `checkWorkspaceAccessMiddleware` function checks if the current user is a member 
of the requested Workspace. If this middleware succeeds, the next middleware 
applies Permission and Role checking logic.

The following is an example of `checkWorkspaceAccessMiddleware`:

```javascript
const checkWorkspaceAccessMiddleware = async (req, res, next) => {
    // Checking if the Workspace ID is provided
    const workspaceId = req.params.workspaceId;

    // If no, then pass an error
    if (!workspaceId) {
        console.log(("This means that the request and the params are missing required Workspace ID!"))
        return next(errorFactory(StatusCodes.BAD_REQUEST));
    }

    // Checking if the requestd Worksapce is present in the DB
    const workspaceEntity = await workspaceService.getWorkspaceById(workspaceId);

    // If no, then pass an error
    if (!workspaceEntity) {
        console.log("This means that the requested Workspace is not in the DB.")
        return next(errorFactory(StatusCodes.NOT_FOUND));
    }

    // Check if the current user if at the same time a member of the Worksapce
    const currentUserID = req.user.id;
    const currentUserFromWorkspaceMembers = workspaceEntity.members.find(member => member.user.toString() === currentUserID);

    // If no, then pass an arror
    if (!currentUserFromWorkspaceMembers) {
        console.log("This means that the current user is not a member inside the requested workspace.")
        return next(errorFactory(StatusCodes.NOT_FOUND));
    // Otherwise save the roles and pass to next middleware
    } else {
        req.roles = currentUserFromWorkspaceMembers.role;
        next();
    }
    return next(errorFactory(StatusCodes.FORBIDDEN));
}
```

The `applyRBACMiddleware` function checks if the current user has the required 
permission to access a particular endpoint.

The following is an example of `applyRBACMiddleware`:

```javascript
function applyRBACMiddleware(requiredPermission) {
    return async (req, res, next) => {
        if (hasPermission(req.role, requiredPermission)) {
            next();
        }
        return next(errorFactory(StatusCodes.FORBIDDEN));
    }
}
```

To use the middleware functions, the caller must specify the required permission 
and include the relevant middleware in the route definition:

```javascript
router.post(
    '/',
    taskValidator.validateTask,
    applyRBACMiddleware(Permissions.TASK_CREATE),
    taskController.createTask
);
```

## Permissions and Roles

The main api to check the rol and permission looks like this:

```javascript
hasPermission(role, permission)
```
For the Workspace we will have the following roles:

- Creator - can do all the CRUD operations with the Workspace entities,
- Member - can view everything, can create new entities, but can't delete the entities whose creator is a diferent user.
- Guest - can only view

## Discussion

We need to determine the best way to implement a role-based system that is 
both scalable and simple. The Workspace will contain many entities such as
notes, events, meetups, stories, and more in the future. We want to create 
a system that is not dependent on the number of features and can dynamically 
scale as needed. This means the roles and permissions model should have control 
over each entity in the Workspace.

## Examples

```javascript
const roles = {
  Creator: {
    permissions: {
      tasks: ['create', 'read', 'update', 'delete'],
      notes: ['create', 'read', 'update', 'delete'],
      events: ['create', 'read', 'update', 'delete'],
      stories: ['create', 'read', 'update', 'delete'],
      workspace: ['read', 'update']
    }
  },
  Member: {
    permissions: {
      tasks: ['create', 'read', 'update'],
      notes: ['create', 'read', 'update'],
      events: ['create', 'read', 'update'],
      stories: ['create', 'read', 'update'],
      workspace: ['read']
    }
  },
  Guest: {
    permissions: {
      tasks: ['read'],
      notes: ['read'],
      events: ['read'],
      stories: ['read'],
      workspace: ['read']
    }
  }
};
```

The logic to check the permissions is the following:

```javascript
function checkPermission(entity, action) {
  return function(req, res, next) {
    const role = req.user.role;
    // Check if the entity exists in the permissions object for the current role
    if (roles[role] && roles[role].permissions[entity]) {
      // Check if the current action is allowed for the entity
      if (roles[role].permissions[entity].includes(action)) {
        next(); // User has permission, continue with the next middleware or route handler
      } else {
        res.status(403).send('You do not have permission to perform this action on this entity.');
      }
    } else {
      res.status(404).send('This entity does not exist or you do not have permission to access it.');
    }
  }
}
```

The calling side looks like this:

```javascript
// Route for creating a new task (requires Creator role)
app.post('/tasks', checkPermission('tasks', 'create'), function(req, res) {});

// Route for updating an existing task (requires Creator or Member role)
app.put('/tasks/:id', checkPermission('tasks', 'update'), function(req, res) {});

// Route for deleting a task (requires Creator role)
app.delete('/tasks/:id', checkPermission('tasks', 'delete'), function(req, res) {});
```




    