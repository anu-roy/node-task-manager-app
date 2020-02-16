const jwt = require('jsonwebtoken');
const User = require('../models/users');

const auth = async (req,res,next)=>{
    try{
    const token = req.header('Authorization').replace('Bearer ','');
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decode)
    const user = await User.findOne({_id:decode,'tokens.token':token});
     if(!user)
     {
         throw new Error()
     }
     req.token=token;
     req.user=user;
     next()
    }
    catch(e)
    {
        res.status(400).send('Please authenticate')
    }
    
}

module.exports= auth;