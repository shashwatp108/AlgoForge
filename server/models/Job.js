const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    language:{
        type: String,
        required: true,
        enum: ["cpp", "c", "python", "py", "java", "javascript", "js"],
    },
    filepath: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    output: {
        type: String, // Storing output so users can see what their code produced
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "success", "error"],
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Link this to the User model
        required: false, // Allow anonymous submissions (optional)
    },
});

module.exports = mongoose.model("Job", JobSchema);