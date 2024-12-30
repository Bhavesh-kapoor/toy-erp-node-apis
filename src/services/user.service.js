import User from "#models/user"

export async function getUser(id,filter={}){
    if(!id){
        const userData = await User.find(filter);
        return userData;
    }
    const userData = await User.findById(id);
    return userData
}

export async function  createUser(userData){
    const user = await User.create(userData);
    return user;
}

export async function updateUser(id,updates){
    const user = await User.findById(id);
}

export const deleteUser=(async(id)=>{
    const findUserBYid =  await User.findByIdAndDelete(id);
    return findUserBYid;

})

