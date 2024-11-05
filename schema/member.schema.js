const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addPeopleSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

const AddPeople = mongoose.model("addPeople", addPeopleSchema);

module.exports = AddPeople;
