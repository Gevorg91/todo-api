const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const config = require('config');

// Generate JWT token
// TODO: Generate two tokens for Refresh and Access cases.
const generateToken = (id) => {
    return jwt.sign({ id }, config.get('JWT_SECRET'), { expiresIn: '1h' });
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();

        // TODO: Two tokens.
        const token = generateToken(user._id);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Authenticate and log in a user
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = generateToken(user._id);
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// TODO: We need an endpoint to refresh token, please research the best practices but in general it should
// TODO: involve some specific headers. Also there is a difference from client side between mobile and web. 
// TODO: We need to research that part as well.

// TODO: We need to add email verification logic, there are some packages that will help with that. We may start thinking
// TODO: about this if decided to go with node.js solution instead of AWS.