const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
    email : String,
    subject : String,
    mailText : String,
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
    read : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('mails', mailSchema);