
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
     name: {
        type:  String,
        required :  true,
        trim  : true
     },
    email :  {
        type:  String,
        unique:true,
    required :  true,
    trim  : true
    },
    password :{
        trim :true,
        required:true,
        type:String
    },
    phone :{
        type:String,
    },
    role:{
        type :  mongoose.Schema.Types.ObjectId,
        ref : "Role"
    },
    address:{
        type:String,
    },
    isDeleted:{
        type:Boolean,
        default:false
    }     
    }
);

export default mongoose.model('User',UserSchema);