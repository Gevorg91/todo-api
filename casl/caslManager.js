const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const {Workspace, Role} = require("../models/workspaceModel");

exports.createAbilitiesForUserPerWorkspace = async (user, workspaceId) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const workspace = await Workspace.findOne({_id: workspaceId});

    if (workspace.owner.toString() === user.id) {
        can("manage", "Task")
        can("manage", "Workspace")
    } else {
        const userInWorkspace = await workspace.members.find(member => member.user.toString() === user.id);

        if (userInWorkspace) {
            can(['read','create'], "Task");
            can (["update", "delete"],"Task", { user: user.id });
        } else {
            cannot(['read', 'create', 'update', 'delete'], 'Task');
        }
    }
    return build();
}
