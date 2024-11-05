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
        enum: ['high', 'moderate', 'low'],
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterUser", // Reference the RegisterUser model
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterUser", // Reference the RegisterUser model
        required: true,
    },
    dueDate: Date,
    status: {
        type: String,
        enum: ["backlog", "toDo", "inProgress", "done"],
        default: "toDo",
    },
    checklist: [{
        name: String,
        completed: { type: Boolean, default: false },
    }],
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
