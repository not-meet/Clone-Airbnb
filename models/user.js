const mongoose = require('mongoose');
const schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

//creating a schema
const userSchema = new schema({
    email: {
        type : String,
        required : true,
    }
});

userSchema.plugin(passportLocalMongoose); //using the passport plugin on the to add salt and hash in the username also to add the username

module.exports = mongoose.model("User",userSchema); // user is the file name 
