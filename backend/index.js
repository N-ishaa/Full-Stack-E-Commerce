import {app} from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config({
    path: './.env'
});



const PORT = 8080 || process.env.PORT


connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("connnect to DB")
        console.log("Server is running "+PORT)
    })
}).catch((err)=>{
    console.log("DB connection failed", err.message)
})
