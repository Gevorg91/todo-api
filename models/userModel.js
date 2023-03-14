const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    // TODO: Shouldn't we store refresh and access tokens in the users collection? 

});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    // TODO: We need to read what is for `this` keyword used in JS just to improve our knowledge on the language side as well.
    const user = this;
    // TODO: What is this check for? If the field is being set or something?
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Add a custom method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
