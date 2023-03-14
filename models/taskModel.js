const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // TODO: I would just keep title and make life simple while we are still setting up the infrastructure.
    // TODO: This will help a bit while testing. We will start adding field when start the application logic.
    // TODO: Up to you.
    title: String,
    // TODO: We need creator field to know which user creates it.
    description: String,
    dueDate: Date,
    completed: Boolean,
});

module.exports = mongoose.model('Task', taskSchema);

