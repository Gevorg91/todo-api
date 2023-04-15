class AppStartupConfig {
    constructor(dbUri, port) {
        this.dbUri = dbUri;
        this.port = port;
    }
}

module.exports = AppStartupConfig;
