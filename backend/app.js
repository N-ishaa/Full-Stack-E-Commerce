import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';

const app = express()

const corsOptions = {
    origin: [
        process.env.CORS_ORIGIN || "http://localhost:3000",
       "https://full-stack-e-commerce-jade.vercel.app/", // Your Vercel URL
        "https://your-custom-domain.com" // If you have a custom domain
    ],
    credentials: true, // Important for cookies/auth
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use("/api",router)
export {app} ;