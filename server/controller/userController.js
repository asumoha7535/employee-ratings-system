const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            password,
            userType,
            gender,
            dateOfBirth,
            address,
            nationality,
            avatar
        } = req.body;

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format. Phone number should have 10 digits' });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phoneNumber: phoneNumber }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with given email or phone number already exists' });
        }

        const user = new User({
            name,
            email,
            phoneNumber,
            password,
            userType,
            gender,
            dateOfBirth,
            address,
            nationality,
            avatar
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, password, userType } = req.body;

        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.userType !== userType) {
            return res.status(401).json({ message: 'Access denied .! Wrong user type' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userForResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userType: user.userType,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            address: user.address,
            nationality: user.nationality,
            avatar: user.avatar,
        };

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        res.json({
            message: 'Logged in successfully',
            user: userForResponse,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const query = {};
        if (req.query.userType) {
            query.userType = req.query.userType;
        }

        const users = await User.find(query, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserById = async (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.ChangePassword = async (req, res) => {
    const id = req.params.id;
    console.log(id);

    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Old password is incorrect" });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update user data with new password and PasswordUpdateDate
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                password: hashedNewPassword,
                PasswordUpdateDate: new Date(),
            },
            { new: true }
        );

        res.status(200).json({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Unable to update password", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
