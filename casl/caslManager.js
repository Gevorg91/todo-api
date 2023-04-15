const { AbilityBuilder, createMongoAbility } = require("@casl/ability");
const { Workspace, Role } = require("../models/workspaceModel");

exports.createAbilitiesForUserPerWorkspace = async (user, workspaceId) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  const workspace = await Workspace.findOne({ _id: workspaceId });
  const userInWorkspace = await workspace.members.find(
    (member) => member.user.toString() === user.id
  );

  switch (userInWorkspace?.role) {
    case Role.ADMIN:
      can("manage", "Task");
      can("manage", "Workspace");
      break;
    case Role.MEMBER:
      can(["read", "create"], "Task");
      can(["update", "delete"], "Task", { user: userInWorkspace.id });
      break;
    case Role.GUEST:
      can(["read"], "Task");
      break;
    default:
      break;
  }

  return build();
};
