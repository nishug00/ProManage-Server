const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const registerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    
});

const RegisterUser = mongoose.model("RegisterUser", registerSchema);

module.exports = RegisterUser;