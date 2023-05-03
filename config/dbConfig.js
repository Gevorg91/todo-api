const mongoose = require("mongoose");

exports.connectDB = async (dbUri) => {
  try {
    await mongoose.connect(dbUri, {
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

exports.dropDatabase = async () => {
  mongoose.connection
    .dropDatabase()
    .then(() => console.log("Database dropped."))
    .catch((error) => console.error(error));
};
