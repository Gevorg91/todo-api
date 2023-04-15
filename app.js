const {appFactory} = require("./appFactory");
const config = require('config');

appFactory(config.get('MONGO_URI'))
