// TODO: GENERAL QUESTION - Should we use new ES6 instead?
const mongoose = require('mongoose');
const config = require('config');

const connectDB = async () => {
    try {
        // TODO: Please, create Mongo DB Free Account and connect to the server. It is free for development.
        // TODO: Will make life easier to work with the DB visually.
        await mongoose.connect(config.get('MONGO_URI'), {
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected in ${config.get('NODE_ENV')} mode`);
    } catch (err) {
        // TODO: We need to think about general error handling strategy. Not for particularly this case, as technically
        // TODO: the server will try to connect to DB only when launching, no user request will face this.
        console.error(err.message);
        // TODO: Why we need this?
        process.exit(1);
    }
};

module.exports = connectDB;