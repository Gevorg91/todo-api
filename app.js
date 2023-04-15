const {appFactory} = require("./appFactory");
const config = require('config');
const AppStartupConfig = require("./config/appStartupConfig");

appFactory(new AppStartupConfig(config.get('MONGO_URI'), config.get('PORT')));
