const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the permissions schema
const permissionsSchema = new mongoose.Schema(
  {
    dashboard: { type: Boolean, default: false },
  },
  { _id: false }
);

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, trim: true, required: true },
    lastname: { type: String, trim: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },

    phoneNumber: {
      type: String,
      required: true,
    },

    // identifier: {
    //   type: String,
    //   required: true,
    // },

    role: {
      type: String,
      enum: ["admin", "hr", "employee"],
      required: true,
      default: "employee",
    },
    employeeid: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      enum: ["development", "sales", "marketing", "ui/ux"],
      required: true,
      default: "development",
    },
    designation: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      default: new Date(),
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isMentor: {
      type: Boolean,
      required: true,
    },
    mentorId: {
      type: String,
    },

    permissions: permissionsSchema,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (!this.permissions || Object.keys(this.permissions).length === 0) {
    this.permissions = {
      dashboard: true,
    };
  }

  // Set permissions based on the user's role
  if (this.isModified("role" || this.isNew())) {
    if (this.role === "admin") {
      this.permissions = {
        dashboard: true,
      };
    } else if (this.role === "hr" || "employee") {
      this.permissions = {
        dashboard: false,
      };
    }
  }

  next();
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
