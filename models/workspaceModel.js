const mongoose = require("mongoose");

const Role = {
    ADMIN: 'admin',
    MEMBER: 'member',
    GUEST: 'guest',
};

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    role:
        {
            type: String,
            enum: Object.values(Role),
            default: Role.MEMBER
        },
});

const workspaceSchema = new mongoose.Schema({
    name:
        {
            type: String, required: true,
        },
    owner:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", required: true,
        },
    members: [memberSchema]
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = {
    Workspace,
    Role,
};