const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ['high', 'moderate', 'low'], // Restrict values to these
    },
    assignee: {
        type: mongoose.Schema.ObjectId,
        ref: "AddPeople",
        required: true,
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ["backlog", "toDo", "inProgress", "done"],
        default: "toDo", // Default status set to "toDo"
    },
    checklist: [{
        name: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    }],
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
