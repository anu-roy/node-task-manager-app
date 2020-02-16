const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const User = require('../models/users');
const auth = require('../middleware/auth')

router.get('/',(req,res)=>{
    res.send('Tesr router');
})

router.post('/users',async (req,res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        const token = user.generateAuthToken();
        res.status(201).send({
        status:'success',
        data:user,
        token:token
    })
    }
    catch(e){
        res.status(400).send(e)
    }
   
    // console.log(user);
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((error)=>{
    //     // res.status(400);
    //     // res.send(error)
    //     console.log(error);
    //     res.status(400).send(error)
    // })
})

router.post('/user/login', async(req,res)=>{
    try{
        const user = await User.findUserByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
       
        // res.send({
        //     status:'success',
        //     data:user.getPublicData(),
        //     token:token
        // })

        res.send({
            status:'success',
            data:user,
            token:token
        })
    }
    catch(e)
    {
       // console.log(e)
        res.status(400).send({
            status:'error',
            message:e.message
        });
    }
   
})

router.post('/user/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!== req.token
        })
        await req.user.save();
        res.status(200).send({
            status:'success',
            message:'user successfully logged out'
        })
    }
    catch(e)
    {
        res.status(500).send();
    }
})

router.post('/user/logoutall',auth, async(req,res)=>{
    try{
        req.user.tokens=[];
        await req.user.save();
        res.status(200).send({
            status:'success',
            message:'user successfully logged out'
        })
    }
    catch(e)
    {
        res.status(500).send();
    }
})

router.get('/user/me',auth,(req,res)=>{
    res.send({
        status:'error',
        data:req.user
    })
})

const upload = multer({
  //  dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb)
    {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('Uploade file format not supported'))
        }
        cb(undefined,true)
    }
})

router.post('/user/me/avatar',auth, upload.single('avatar'),async(req,res)=>{
   // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/user/me/delete',auth, async(req,res)=>{
    req.user.avatar=undefined;
    await req.user.save();
    res.status(200).send();
})

router.get('/user/:id/avatar', async(req,res)=>{
    try{
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar)
    {
        throw new Error()
    }
    res.set('Content-Type','image/jpg');
    res.send(user.avatar)
}
catch(e)
{
    res.status(400).send()
}
})

router.get('/get-all-users', async (req,res)=>{
    try{
        const users = await User.find({});
        res.send({
            status:'success',
            data:users
        })
    }
    catch(e){
        res.status(500).send({
            status:500,
            message:"Server problem"
            })
    }
    // User.find({}).then((users)=>{
    //     res.send({
    //         status:'success',
    //         data:users
    //     })
    // }).catch((error)=>{
    //     res.status(500).send({
    //         status:500,
    //         message:"Server problem"
    //     })
    // })
})

router.get('/get-user-by-id/:id', async (req,res)=>{
    const _id=req.params.id;
    try{
        const users = await User.findById(_id);
        res.send({
            status:'success',
            data:users
        })
    }
    catch(e)
    {
        console.log(e)
        res.status(500).send({
          status:500,
          message:e
         })
    }
    // User.findById(_id).then((users)=>{
    //     res.send({
    //         status:'success',
    //         data:users
    //     })
    // }).catch((error)=>{
    //     res.status(500).send({
    //         status:500,
    //         message:"Server problem"
    //     })
    // })
   
})

router.patch('/update-user/:id', async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValid = updates.every((update)=>allowedUpdates.includes(update));
    console.log(updates);
    console.log(isValid)
    if(!isValid)
    {
        return res.status(400).send({error:'Invalid Update'})
    }

    try{
        const user = await User.findById(req.params.id);
        updates.forEach((update)=> user[update]=req.body[update])
        await user.save();
       // console.log(req.params.id,req.body)
       // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true});

        if(!user)
        {
            return res.status(400).send();
        }
        res.send(user)
    }
    catch(e)
    {
        console.log(e)
        res.status(400).send(e)
    }
})

router.patch('/user/update-own-profile',auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValid = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValid)
    {
        return res.status(400).send({error:'Invalid Update'})
    }

    try{
        const user= req.user;
        updates.forEach((update)=> user[update]=req.body[update])
        await user.save();
        res.send({
            status:'success',
            message:'user updated successfully',
            data:user
        })

    }catch(e)
    {
        console.log(e)
        res.status(400).send(e.message)
    }
})

router.delete('/delete-user/:id', async (req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user)
        {
            return res.status(400).send({message:'No data found to delete'})
        }
        res.send(user)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})


router.delete('/user/delete-own-account',auth, async(req,res)=>{
    try{
        await req.user.remove();
        res.send({
            status:'success',
            message:'Deleted successfully'
        })
    }catch(e)
    {
        res.send({
            status:'Error',
            message:e.message
        })
    }
  
})

module.exports= router;