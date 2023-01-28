
const mongoose=require('mongoose')
const mongoURI="mongodb://localhost:27017/social_user";
const connectToMongo=()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("successfully connected");
    })
} 
module.exports=connectToMongo