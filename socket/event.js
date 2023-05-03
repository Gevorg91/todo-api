const Event = {
  TASK_CREATED: "task_created",
  TASK_UPDATED: "task_updated",
  TASK_DELETED: "task_deleted",
  WORKSPACE_UPDATED: "workspace_updated",
  WORKSPACE_DELETED: "workspace_deleted",
  MEMBER_IS_ONLINE: "member_is_online",
};

Object.freeze(Event);

module.exports = Event;
