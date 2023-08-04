const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    task : String,
    priority : String,
})

const User = mongoose.model("User",userSchema);
module.exports = User;