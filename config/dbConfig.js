const mongoose = require('mongoose');
const config = require('config');

const connectDB = async (dbUri) => {
    try {
        await mongoose.connect(dbUri, {
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected in ${config.get('NODE_ENV')} mode`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;