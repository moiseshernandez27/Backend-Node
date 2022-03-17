import mongoose from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

//SCHEMA USERS
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comments'
        }
    ]
});
userSchema.plugin(passportLocalMongoose);
 export default  mongoose.model('User', userSchema);