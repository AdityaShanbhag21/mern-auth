const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Helper function to generate a JWT
 */
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }

        // 2. Hash password (Senior practice: salt rounds = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User in MongoDB
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        // 4. Generate Token & Send Response
        const token = signToken(newUser._id, newUser.role);
        
        res.status(201).json({
            success: true,
            token,
            data: {
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            }
        });
    } catch (err) {
        // Pass error to the global error handler middleware
        next(err); 
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Validate email & password presence
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide an email and password' 
            });
        }

        // 2. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // 3. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // 4. Create Token & Send Response
        const token = signToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
};