const mongoose = require('mongoose');
const config = require('config');

const connectDB = async (dbUri) => {
    try {
        await mongoose.connect(dbUri, {
            useUnifiedTopology: true
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;