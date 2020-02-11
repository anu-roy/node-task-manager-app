require('../src/db/mongoose');
const User = require('../src/models/users');

// User.findByIdAndUpdate('5e355659290a0533fc8e5e23',{age:1}).then((user)=>{
//     console.log(user);
//     return User.countDocuments({age:1});
// }).then((result)=>{
//     console.log(result)
// }).catch((error)=>{
//     console.log(error)
// })

const updateAgeandCount = async (id,age)=>{
    const user = await User.findByIdAndUpdate(id,{age});
    const count = await User.countDocuments({age});
    return count;
}

updateAgeandCount('5e355677ffee3538a813addb',1).then((result)=>{
    console.log(result)
}).catch((error)=>{
    console.log(error)
})
