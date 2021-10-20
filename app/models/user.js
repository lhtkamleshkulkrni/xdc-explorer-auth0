const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {type: String, default: ''},
    firstName: {type: String, default: ''},
    middleName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    email: {type: String, default: '', lowercase: true},
    phone: {type: Number, default: ''},
    password: {type: String, default: ''},
    age: {type: Number, default: ''},
    photo: {type: Object, default: ''},
    gender: {type: String, default: ''},
    addedOn: { type: Date, default: new Date()}
})

const User = mongoose.model("usersDetails",userSchema);

module.exports = User;