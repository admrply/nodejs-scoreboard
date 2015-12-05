// app/models/flag.js
var mongoose = require('mongoose');

// define the schema for our user model
var flagSchema = mongoose.Schema({
    flag : String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Flag', flagSchema);