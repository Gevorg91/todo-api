const Task = require("../models/taskModel");
const { Workspace } = require("../models/workspaceModel");

exports.createTask = async (user, taskData) => {
  const { title, description, workspace } = taskData;
  const task = new Task({ title, description, user, workspace });
  await task.save();
  const workspaceParent = await Workspace.findById(workspace);
  workspaceParent.tasks.push(task._id);
  await workspaceParent.save();
  return task;
};

exports.getAllTasks = async (userId) => {
  return Task.find({ user: userId });
};

exports.getTask = async (taskId, userId) => {
  return Task.findOne({ _id: taskId, user: userId });
};

exports.getTaskById = async (taskId) => {
  return Task.findOne({ _id: taskId });
};

exports.updateTask = async (taskId, updateData) => {
  return Task.findOneAndUpdate({ _id: taskId }, updateData, { new: true });
};

exports.deleteTask = async (taskId, userId) => {
  return Task.findOneAndDelete({ _id: taskId });
};

exports.getWorkspaceByTaskId = async (taskId) => {
  const task = await Task.findById(taskId);
  if (task) {
    return task.workspace;
  }
  return null;
};
