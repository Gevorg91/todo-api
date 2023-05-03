const mongoose = require("mongoose");

const Role = {
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
};

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.GUEST,
  },
});

const taskSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  members: [memberSchema],
});

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = {
  Workspace,
  Role,
};
