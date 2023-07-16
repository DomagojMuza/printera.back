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
                throw new Error('Krivi email')
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
                throw new Error("Nedozovljena lozinka")
            }
        }
    },
}, {
    timestamps: true
})


UserSchema.methods.makeUserAuthToken = async function()
{
    const token = jwt.sign({ _id: this._id.toString()}, 'webappprojekt', {expiresIn: '12h'})
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
        throw new Error('Podaci netočni')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw new Error('Podaci netočni')
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
        next(new Error('Korisnik već postoji'));
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