const express = require("express");
const app = express();
const port = 80;
app.use(express.json());



// var cors = require('cors')
// app.use(cors())
const connectToMongo=require('./db');
connectToMongo();



const userRouter=require('./Routes/user')
const postRouter=require('./Routes/post')

// const authRouter=require('../routes/auth')


app.use('/users',userRouter);
app.use('/api/post',postRouter);





app.listen(port, ()=>{
    console.log(`The application started successfully on port ${port}`);
});