const User = require('../models/users.model');
const httpStatusText = require('../utils/httpStatusText');
const asynWrapper = require('../middleware/asyncwrapper');
const appError = require('../utils/appError');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const generateJWT = require('../utils/generateJWT');

const getAllUsers = async (req, resp) => {
    const query = req.query;

    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const users = await User.find({}, { '__v': false, 'password': false }).limit(limit).skip(skip);

    resp.json({ status: httpStatusText.SUCCESS, data: { users } });
}

const register = asynWrapper(async (req, resp, next) => {
    const { firstName, lastName, email, password, role } = req.body;

    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
        // return resp.status(400).json({ status: httpStatusText.FAIL, data: null, code: 400 })

        const error = appError.create('User already exists', 400, httpStatusText.FAIL);
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
    })

    // generate JWT token
    const token = await generateJWT({ email: newUser.email, id: newUser._id, role: newUser.role })
    newUser.token = token;

    await newUser.save();

    resp.status(201).json({ status: httpStatusText.SUCCESS, data: { users: newUser } })
})

const login = asynWrapper(async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email && !password) {
        const error = appError.create('Email and password are required', 400, httpStatusText.FAIL);
        return next(error);
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        const error = appError.create('User is not found', 400, httpStatusText.FAIL);
        return next(error);
    }

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (user && matchedPassword) {
        // Logged-in successfuly
        const token = await generateJWT({ email: user.email, id: user._id, role: user.role })

        return resp.status(200).json({ status: httpStatusText.SUCCESS, data: { token } });
    }
    else {
        const error = appError.create('Something wrong', 500, httpStatusText.ERROR);
        return next(error);
    }
})

module.exports = {
    getAllUsers,
    register,
    login
}