import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';

const app = express()
app.use(cors({
    // origin : process.env.CORS_ORIGIN,
    origin : "http://localhost:3000",
    credentials : true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api",router)
export {app} ;