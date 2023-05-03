const { appFactory } = require("./appFactory");
const config = require("config");
const AppStartupConfig = require("./config/appStartupConfig");

appFactory(new AppStartupConfig(config.get("MONGO_URI"), config.get("PORT")))
  .then(({ app, server }) => {
    console.log(`MongoDB connected in ${config.get("NODE_ENV")} mode`);
    console.log(`Server running on port ${server.address().port}`);
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
  });
