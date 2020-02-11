const express = require('express');
require('./db/mongoose');
const User = require('./models/users');
//const Task = require('./models/tasks');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

const port = process.env.PORT || 3000;

// app.use((req,res,next)=>{
//     console.log(req.path)
//     if(req.method === 'GET')
//     {
//         res.send({
//             status:'error',
//             msg:'Get not supported'
//         })
//     }
//     else{
//         next()
//     }
//})

// app.use((req,res,next)=>{
//     res.status(503).send('Site is under maintance')
// })
  


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);



app.listen(port,()=>{
    console.log("server started on port "+port)
})

//const Task = require('./models/tasks');
//const User = require('./models/users');

const main = async ()=>{
    // const task = await Task.findById('5e4021b13ab2b41fc47b63d0');
    // await task.populate('owner').execPopulate();
    // console.log(task.owner)

//     const user = await User.findById('5e3fc60f9d6258443cc53bb1');
//    // console.log(user)
//     await user.populate('tasks').execPopulate();
//     console.log(user)
}

main()