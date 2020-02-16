const validator = require('validator');
const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Task = require('./tasks');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Please provide a valid email')
            }
        }
    },
    password:{
        type:String,
        required: true,
        trim:true,
        minlength:7,
        validate(value)
        {
             if(value.toLowerCase().includes('password'))
             {
                throw new Error('Pssword can not contain the letter password')
             }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value)
        {
            if(value<0)
            {
                throw new Error('Age always be positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},
{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

// userSchema.methods.getPublicData =  function(){
//     const user=this;
//     const userObj = user.toObject();

//     delete userObj.tokens;
//     delete userObj.password;
//      return userObj;
// }


userSchema.methods.toJSON =  function(){
    const user=this;
    const userObj = user.toObject();

    delete userObj.tokens;
    delete userObj.password;
     return userObj;
}


userSchema.methods.generateAuthToken = async function(){
    const user=this;
    const token = await jwt.sign(user._id.toString(),process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token:token})
    await user.save();
    return token;
}

// Find user by credentials
userSchema.statics.findUserByCredentials = async(email,password)=>{
   // console.log(email,password)
    const user = await User.findOne({email});
  //  console.log(user);
    if(!user)
    {
        throw new Error('No user exists with this email')
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch)
    {
        throw new Error('Password incorrect')
    }
    return user;
}


// Hashing password
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password,8);
    }
    
    next();
})


//Delete all taskks when user is deleted
userSchema.pre('remove', async function(next){
    const user=this;
    await Task.deleteMany({owner:user._id});
    next();
})
const User = mongoose.model('User',userSchema)

module.exports = User;