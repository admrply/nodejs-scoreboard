// app/models/team.js
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var teamSchema = mongoose.Schema({

    local            : {
        name     : String,
        password : String,
        flags    : [String]
    }
});

// methods ======================
// generating a hash
teamSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
teamSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', teamSchema);