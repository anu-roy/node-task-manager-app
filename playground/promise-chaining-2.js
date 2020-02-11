require('../src/db/mongoose');
const Task = require('../src/models/tasks');

// Task.findByIdAndDelete('5e3524c76bab871cb0137e52').then((task)=>{
//     console.log(task);
//     return Task.countDocuments({completed:true});
// }).then((count)=>{
//     console.log(count);
// }).catch((error)=>{
//     console.log(error)
// })

const deeleteDocumentandCount = async(id,type)=>{
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed:type});
    return count;
}

deeleteDocumentandCount('5e355a68c2b51e2f2026ef23',true).then((count)=>{
    console.log(count)
}).catch((error)=>{
    console.log(error)
})