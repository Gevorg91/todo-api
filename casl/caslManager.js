const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const {Workspace, Role} = require("../models/workspaceModel");

exports.createAbilitiesForUserPerWorkspace = async (user, workspaceId) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const workspace = await Workspace.findOne({_id: workspaceId});
    const userInWorkspace = await workspace.members.find(member => member.user.toString() === user.id)

    if (workspace && userInWorkspace) {
        if (userInWorkspace.role === Role.ADMIN) {
            can("manage", "Task")
            can("manage", "Workspace")
        } else if (userInWorkspace.role === Role.MEMBER) {
            can(['read','create'], "Task");
            can (["update", "delete"],"Task", { user: userInWorkspace.id });
        } else if (userInWorkspace.role === Role.GUEST) {
            can(['read'], "Task");
        }
    }

    return build();
}
