const express = require('express');
const router = new express.Router();
const Task = require('../models/tasks');
const auth = require('../middleware/auth');


router.post('/create-task',auth, async(req,res)=>{
    //const task= new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save();
        res.status(201).send(task)
    }
    catch(e)
    {
        res.status(400).send(e)
    }
    // console.log(task)
    // task.save().then(()=>{
    //     res.status(201).send(task)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

router.get('/get-all-task',auth,async (req,res)=>{
    const myVal={};
    if(req.query.completed)
    {
        myVal.completed = req.query.completed ==='true';
    }
    try{
      
        if(req.query.completed!=undefined)
        {
            console.log('inside if')
            const tasks= await Task.find({owner:req.user._id,completed:myVal.completed});
            res.send({
                status:'success',
                data:tasks
            })
        }
       
        else
        {
            console.log("inside else")
            console.log(req.user._id)
            const tasks= await Task.find({owner:req.user._id});
            res.send({
                status:'success',
                data:tasks
            })
        }
       
    //    await req.user.populate({
    //        path:'tasks',
    //        myVal
    //     }).execPopulate();
    //     res.send({
    //         status:'success',
    //         data:req.user.tasks
    //     })
    //await req.user.populate('tasks').execPopulate();

    res.send({
                status:'success',
                data:tasks
            })
       
    }
    catch(e)
    {
        res.status(500).send(e)
    }
    // Task.find({}).then((task)=>{
    //     res.send({
    //         status:'success',
    //         data:task
    //     })
    // }).catch((error)=>{
    //     res.status(500).send(error)
    // })
})

router.get('/get-own-task-by-id/:id',auth,async(req,res)=>{
    try{
        console.log(req.user._id)
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id});
        if(!task)
        {
            return res.status(400).send({
                status:'success',
                data: 'No data found'
            })
        }
        res.send({
            status:'success',
            data:task
        })
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/get-task-by-id/:id',auth,async(req,res)=>{
    const _id=req.params.id;
    try{
        const task = await Task.findById(_id);
        if(!task)
        {
            return res.status(400).send({
                status:'success',
                data: 'No data found'
            })
        }
        res.send({
            status:'success',
            data:task
        })
    }
    catch(e)
    {
        res.status(500).send(error)
    }
    // Task.findById(_id).then((task)=>{
    //     if(!task)
    //     {
    //        return res.status(400).send({
    //             status:'success',
    //             data: 'No data found'
    //         })
    //     }
    //     res.send({
    //         status:'success',
    //         data:task
    //     })
       
    // }).catch((error)=>{
    //     res.status(500).send(error)
    // })
})

router.patch('/update-task/:id',auth, async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates= ['description','completed'];
    const isValid = updates.every((update)=>allowedUpdates.includes(update));

    if(!isValid)
    {
        return res.status(400).send({error:'invalid update'})
    }
    try{
        console.log(req.params.id,req.body)
      //  const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
       
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true});
        console.log(task)
        if(!task)
        {
            return res.status(400).send();
        }
        updates.forEach((update)=> task[update]=req.body[update]);
        await task.save();
        res.send(task)
    }
    catch(e)
    {
        res.status(400).send();
    }
})

router.delete('/delete-task-by-id/:id',auth,  async(req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task)
        {
            return res.status(400).send({
                status:'error',
                message:'No task esists'
            })
        }
        res.status(200).send({
            status:'success',
            message:'Deleted successfully'
        })

    }catch(e)
    {

    }
})
module.exports= router;