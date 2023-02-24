const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    date: {type : String, required: true},
    task: { type: String, default: null },
    status: { enum: ['completed', 'incomplete'],type: String, default: 'incomplete' },
    userEmail: { type: String }
});

module.exports = mongoose.model("post", postSchema);