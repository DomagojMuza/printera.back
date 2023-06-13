const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Enter email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: [true, 'Enter password'],
        trim: true,
        minlength: [8, 'Password too short'],
        validate(val){
            if(val.toLowerCase().includes('password')){
                throw new Error("Your password cannot conatain 'password'")
            }
        }
    },
}, {
    timestamps: true
})


UserSchema.methods.makeUserAuthToken = async function()
{
    const token = jwt.sign({ _id: this._id.toString()}, process.env.TOKEN_KEY, {expiresIn: '12h'})
    return token
}

UserSchema.methods.toJSON = function() 
{
    const userObject = this.toObject()
    delete userObject.password
    return userObject
}


UserSchema.statics.findUser = async (email, password) =>
{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw new Error('Unable to login')
    }
    return user
}

//Hesirana lozinka prije save-a
UserSchema.pre('save', async function(next){
    if (this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

UserSchema.post('save', function (error, doc, next) {
    if (error.code === 11000) 
        next(new Error('User with this email already exists'));
    else next(error);
});

UserSchema.pre('remove', async function(next){
    const user = this
    await Field.deleteMany({owner: user._id})
    await Activity.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', UserSchema)


module.exports = User