const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const {Workspace, Role} = require("../models/workspaceModel");

exports.createAbilitiesForUserPerWorkspace = async (user, workspaceId) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const workspace = await Workspace.findOne({_id: workspaceId});
    const userInWorkspace = await workspace.members.find(member => member.user.toString() === user.id)

    if (workspace && userInWorkspace) {
        if (Role.ADMIN === userInWorkspace.role) {
            can("manage", "Task")
            can("manage", "Workspace")
        } else if (Role.MEMBER === userInWorkspace.role) {
            can(['read','create'], "Task");
            can (["update", "delete"],"Task", { user: userInWorkspace.id });
        } else if (Role.GUEST === userInWorkspace.role) {
            can(['read'], "Task");
        }
    }

    return build();
}
