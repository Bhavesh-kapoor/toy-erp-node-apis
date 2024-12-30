import mongoose from "mongoose";


const connectDB= async(DB_URI)=>{
    try{

        const connection =  await mongoose.connect(DB_URI);
        console.log("connected with database");
    }catch(err){    
        console.log(err);
    }

}
export default connectDB;