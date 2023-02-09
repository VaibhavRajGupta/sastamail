const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/sastaGmail');

const userSchema = mongoose.Schema({
    firstN : String,
    lastN : String,
    username : String,
    gender : String,
    password : String,
    pNumber : String,
    email : String,
    profilePic : {
        type : String,
        default : 'I60Hf.png'
    },
    sentMails : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'mails'
    }],
    recievedMails : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'mails'
    }]

})

userSchema.plugin(plm);

module.exports = mongoose.model('users', userSchema);