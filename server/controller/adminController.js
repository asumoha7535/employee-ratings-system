const Admin = require('../model/admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.registerAdmin = async (req, res) => {
    const {
        name,
        email,
        phoneNumber,
        password,
        gender,
        dateOfBirth,
        address,
        nationality,
        profilePic
    } = req.body;

    try {
        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        admin = new Admin({
            name,
            email,
            phoneNumber,
            password,
            userType: 'admin',
            gender,
            dateOfBirth,
            address,
            nationality,
            profilePic
        });

        await admin.save();

        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    const { phoneNumber, password, userType } = req.body;

    try {
        if (userType !== 'admin') {
            return res.status(403).json({ message: "Access denied .! Wrong user type." });
        }

        const admin = await Admin.findOne({ phoneNumber, userType });
        if (!admin) {
            return res.status(400).json({ message: "Admin not found." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const adminDetails = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            userType: admin.userType,
            gender: admin.gender,
            dateOfBirth: admin.dateOfBirth,
            address: admin.address,
            nationality: admin.nationality,
            profilePic: admin.profilePic
        };

        res.json({ message: "Admin logged in successfully", admin: adminDetails, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPasswordAdmin = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editAdmin = async (req, res) => {
    const adminId = req.params.adminId;
    const updates = req.body;

    console.log("adminId", adminId)

    try {
        let admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const allowedUpdates = [
            'name',
            'email',
            'phoneNumber',
            'gender',
            'dateOfBirth',
            'address',
            'nationality',
            'profilePic'
        ];
        const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        }

        Object.keys(updates).forEach((update) => admin[update] = updates[update]);

        await admin.save();

        res.status(200).json({ message: 'Admin updated successfully.', admin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminById = async (req, res) => {
    const adminId = req.params.adminId;
    try {
        let admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin Data retrieved successfully.', admin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

