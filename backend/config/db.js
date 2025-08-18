import mongoose from 'mongoose';


// async function connectDB(){
//     try{
//        const db_connection =  await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
//        console.log(`Connected to database: ${db_connection.connection.host}`);

//     }catch(err){
//         console.log(err.message)
//         process.exit(1) // Exit the process with failure
//     }
// }

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`Connected to database: ${dbConnection.connection.host}`);
    } catch (err) {
        console.error("DB connection failed", err.message);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;