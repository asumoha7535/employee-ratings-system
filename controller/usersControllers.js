const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      phoneNumber,
      role,
      employeeid,
      department,
      designation,
      dateOfJoining,
      location,
      isMentor,
      mentorId,
    } = req.body;

    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    // if (!phoneRegex.test(phoneNumber)) {
    //   identifier = phoneNumber;
    //   return res.status(400).json({
    //     message:
    //       "Invalid phone number format. Phone number should have 10 digits",
    //   });
    // }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { employeeid: employeeid }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with given email or employeeId already exists",
      });
    }

    const user = new User({
      firstname,
      lastname,
      email,
      phoneNumber,
      password,
      role,
      employeeid,
      department,
      designation,
      dateOfJoining,
      location,
      isMentor,
      mentorId,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Prepare user data for response (excluding password)
    const userForResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      employeeid: user.employeeid,
      department: user.department,
      designation: user.designation,
      dateOfJoining: user.dateOfJoining,
      location: user.location,
      isMentor: user.isMentor,
      mentorId: user.mentorId,
    };

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Send response
    res.json({
      message: "Logged in successfully",
      user: userForResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editUserById = async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUserById = async (req, res) => {
  const id = req.params.id;
  const deletes = req.body;
  try {
    const user = await User.findByIdAndDelete(id, deletes, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "user deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
